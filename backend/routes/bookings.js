const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const moment = require('moment');

// Models
const Booking = require('../models/Booking');
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const CareSeeker = require('../models/CareSeeker');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [auth, [
    check('caregiverId', 'Caregiver ID is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty(),
    check('service', 'Service type is required').isIn(['elderly care', 'child care', 'disability care', 'medical care', 'companionship']),
    check('location.address', 'Service location address is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'care seeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const {
            caregiverId,
            startTime,
            endTime,
            service,
            notes,
            location
        } = req.body;

        // Validate times
        const start = moment(startTime);
        const end = moment(endTime);
        
        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        if (start.isBefore(moment())) {
            return res.status(400).json({ message: 'Cannot book in the past' });
        }

        if (end.isBefore(start)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Get caregiver and verify availability
        const caregiver = await Caregiver.findById(caregiverId);
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        if (!caregiver.isVerified) {
            return res.status(400).json({ message: 'Caregiver is not verified' });
        }

        // Check if caregiver provides this service
        if (!caregiver.servicesOffered.includes(service)) {
            return res.status(400).json({ message: 'Caregiver does not provide this service' });
        }

        // Check for scheduling conflicts
        const conflictingBooking = await Booking.findOne({
            caregiver: caregiverId,
            status: 'accepted',
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({ message: 'Caregiver is not available at this time' });
        }

        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        
        if (!careSeeker) {
            return res.status(400).json({ message: 'Care seeker profile not found. Please complete your profile first.' });
        }

        // Calculate price based on duration and hourly rate
        const duration = moment.duration(end.diff(start)).asHours();
        const price = duration * caregiver.hourlyRate;

        const booking = new Booking({
            caregiver: caregiverId,
            careSeeker: careSeeker._id,
            startTime,
            endTime,
            service,
            notes,
            location,
            price: Math.round(price * 100) / 100 // Round to 2 decimal places
        });

        await booking.save();

        // Populate caregiver and care seeker details
        await booking.populate([
            {
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            },
            {
                path: 'careSeeker',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            }
        ]);

        // Emit socket event for real-time updates
        req.app.get('io').to(caregiverId).emit('newBooking', booking);

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private
router.put('/:id', [auth, [
    check('status', 'Status is required').isIn(['accepted', 'rejected', 'completed', 'cancelled'])
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const user = await User.findById(req.user.id);
        const { status } = req.body;

        // Verify authorization based on role and status change
        if (user.role === 'caregiver') {
            const caregiver = await Caregiver.findOne({ user: req.user.id });
            if (booking.caregiver.toString() !== caregiver._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (!['accepted', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status change for caregiver' });
            }
        } else if (user.role === 'care seeker') {
            const careSeeker = await CareSeeker.findOne({ user: req.user.id });
            if (booking.careSeeker.toString() !== careSeeker._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (status !== 'cancelled') {
                return res.status(400).json({ message: 'Care seekers can only cancel bookings' });
            }
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update booking status
        booking.status = status;
        await booking.save();

        // Populate details for response
        await booking.populate([
            {
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            },
            {
                path: 'careSeeker',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            }
        ]);

        // Emit socket event for real-time updates
        const io = req.app.get('io');
        io.to(booking.caregiver.toString()).emit('bookingUpdated', booking);
        io.to(booking.careSeeker.toString()).emit('bookingUpdated', booking);

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .populate({
                path: 'careSeeker',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify authorization
        const user = await User.findById(req.user.id);
        if (user.role === 'caregiver') {
            const caregiver = await Caregiver.findOne({ user: req.user.id });
            if (booking.caregiver.toString() !== caregiver._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        } else if (user.role === 'care seeker') {
            const careSeeker = await CareSeeker.findOne({ user: req.user.id });
            if (booking.careSeeker.toString() !== careSeeker._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router; 