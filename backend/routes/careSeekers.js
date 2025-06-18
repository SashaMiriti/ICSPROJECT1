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
        if (user.role !== 'care seeker') {
            return res.status(403).json({ message: 'Not authorized as care seeker' });
        }

        const careSeeker = await CareSeeker.findOne({ user: req.user.id });
        if (!careSeeker) {
            return res.status(404).json({ message: 'Care seeker profile not found' });
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
    check('preferredServices', 'At least one preferred service is required').isArray({ min: 1 })
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
            specialRequirements,
            preferredServices,
            preferences,
            location
        } = req.body;

        let coordinates = [];
        if (location && location.address) {
            try {
                const geoResults = await geocoder.geocode(location.address);
                if (geoResults.length > 0) {
                    const { latitude, longitude } = geoResults[0];
                    coordinates = [longitude, latitude];
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }

        const careSeekerFields = {
            specialRequirements,
            preferredServices,
            preferences,
            location: location ? {
                type: 'Point',
                coordinates,
                address: location.address
            } : undefined
        };

        let careSeeker = await CareSeeker.findOneAndUpdate(
            { user: req.user.id },
            { $set: careSeekerFields },
            { new: true }
        );

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
        if (user.role !== 'care seeker') {
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
        if (user.role !== 'care seeker') {
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

        // Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
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

        res.json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 