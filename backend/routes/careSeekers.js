const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const NodeGeocoder = require('node-geocoder');

// Models
const CareSeeker = require('../models/CareSeeker');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Initialize geocoder
const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY
});

// @route   GET /api/care-seekers/profile
// @desc    Get current care seeker's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        let careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (!careSeeker) {
            // Create a new care seeker profile if it doesn't exist
            careSeeker = new CareSeeker({
                user: req.user.id,
                fullName: user.username,
                contactNumber: user.phone || '',
                careType: [],
                medicalConditions: [],
                requiredTasks: [],
                caregiverGenderPreference: 'No Preference',
                languagePreferences: [],
                culturalConsiderations: '',
                schedule: {
                    days: [],
                    timeSlots: [{ startTime: '', endTime: '' }]
                },
                location: {
                    type: 'Point',
                    coordinates: [36.8219, -1.2921], // [longitude, latitude]
                    address: 'Nairobi, Kenya'
                },
                budget: null,
                specialNeeds: ''
            });
            await careSeeker.save();
        }

        res.json(careSeeker);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/care-seekers/profile
// @desc    Update care seeker profile
// @access  Private
router.put('/profile', [auth, [
    check('fullName', 'Full name is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        // Log the current database name
        console.log('🔗 Careseeker profile route using database:', req.app.get('mongooseConnection')?.name || (require('mongoose').connection.name));

        const {
            fullName,
            contactNumber,
            careType,
            medicalConditions,
            requiredTasks,
            caregiverGenderPreference,
            languagePreferences,
            culturalConsiderations,
            schedule,
            location,
            budget,
            specialNeeds
        } = req.body;

        // Only use coordinates from frontend; do not attempt geocoding
        let coordinates = [];
        if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            coordinates = location.coordinates;
        }
        // Log the received location and coordinates for debugging
        console.log('Received location:', location);
        console.log('Extracted coordinates:', coordinates);

        const careSeekerFields = {
            fullName,
            contactNumber,
            careType,
            medicalConditions,
            requiredTasks,
            caregiverGenderPreference,
            languagePreferences,
            culturalConsiderations,
            schedule,
            budget,
            specialNeeds
        };

        // Only add location if both address and coordinates are present
        if (location && location.address && coordinates.length === 2) {
            careSeekerFields.location = {
                type: 'Point',
                coordinates,
                address: location.address
            };
        } else if (location && location.address) {
            console.warn('Location coordinates missing; not updating location field.');
        }

        let careSeeker = await CareSeeker.findOneAndUpdate(
            { user: req.user.id },
            { $set: careSeekerFields },
            { new: true, upsert: true }
        );

        let locationToSend = { ...careSeeker.location };
        if (!locationToSend.coordinates || locationToSend.coordinates.length !== 2) {
            locationToSend = {
                type: 'Point',
                coordinates: [36.8219, -1.2921],
                address: 'Nairobi, Kenya'
            };
        }

        res.json(careSeeker);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/care-seekers/bookings
// @desc    Get care seeker's bookings
// @access  Private
router.get('/bookings', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (!careSeeker) {
            return res.status(404).json({ message: 'Care seeker profile not found' });
        }

        const bookings = await Booking.find({ careSeeker: careSeeker._id })
            .populate({
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email phone'
                }
            })
            .sort({ startTime: -1 });

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/care-seekers/reviews/:bookingId
// @desc    Check if review exists for a specific booking
// @access  Private
router.get('/reviews/:bookingId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const review = await Review.findOne({ booking: req.params.bookingId });
        
        if (review) {
            res.json(review);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/care-seekers/reviews
// @desc    Get all reviews by care seeker
// @access  Private
router.get('/reviews', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (!careSeeker) {
            return res.status(404).json({ message: 'Care seeker profile not found' });
        }

        const reviews = await Review.find({ careSeeker: careSeeker._id })
            .populate({
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .populate('booking', 'service startTime endTime')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/care-seekers/reviews
// @desc    Create a review for a caregiver
// @access  Private
router.post('/reviews', [auth, [
    check('booking', 'Booking ID is required').not().isEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const { booking: bookingId, rating, comment } = req.body;

        // Verify booking exists and belongs to this care seeker
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (booking.careSeeker.toString() !== careSeeker._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // Check if booking is completed or eligible for completion
        if (booking.status !== 'completed') {
          const now = new Date();
          if (booking.status === 'accepted' && new Date(booking.endTime) < now) {
            // Auto-complete the booking
            booking.status = 'completed';
            await booking.save();
          } else {
            return res.status(400).json({ message: 'Can only review completed bookings' });
          }
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this booking' });
        }

        const review = new Review({
            booking: bookingId,
            caregiver: booking.caregiver,
            careSeeker: careSeeker._id,
            rating,
            comment
        });

        await review.save();

        // Populate the review for response
        await review.populate([
            {
                path: 'caregiver',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            },
            {
                path: 'careSeeker',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            },
            'booking'
        ]);

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/care-seekers/reviews/:id
// @desc    Update a review by ID (careseeker only)
// @access  Private
router.put('/reviews/:id', [auth, [
    check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').optional().not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'careSeeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (review.careSeeker.toString() !== careSeeker._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }
        // Update fields if provided
        if (req.body.rating !== undefined) review.rating = req.body.rating;
        if (req.body.comment !== undefined) review.comment = req.body.comment;
        await review.save();
        await review.populate([
            { path: 'caregiver', populate: { path: 'user', select: 'name email' } },
            { path: 'careSeeker', populate: { path: 'user', select: 'name email' } },
            'booking'
        ]);
        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 