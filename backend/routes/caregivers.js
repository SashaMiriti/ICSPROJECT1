const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const NodeGeocoder = require('node-geocoder');

// Models
const Caregiver = require('../models/Caregiver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Initialize geocoder
const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY
});

// @route   GET /api/caregivers
// @desc    Get all caregivers with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            services,
            maxHourlyRate,
            minExperience,
            location,
            radius = 50, // Default radius in kilometers
            sortBy = 'rating'
        } = req.query;

        let query = { isVerified: true };

        // Filter by services
        if (services) {
            query.services = { $in: services.split(',') };
        }

        // Filter by hourly rate
        if (maxHourlyRate) {
            query.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
        }

        // Filter by experience
        if (minExperience) {
            query.experienceYears = { $gte: parseInt(minExperience) };
        }

        // Filter by location if provided
        if (location) {
            try {
                const geoResults = await geocoder.geocode(location);
                if (geoResults.length > 0) {
                    const { latitude, longitude } = geoResults[0];
                    query.location = {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [longitude, latitude]
                            },
                            $maxDistance: radius * 1000 // Convert km to meters
                        }
                    };
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }

        let caregivers = await Caregiver.find(query)
            .populate('user', ['name', 'email', 'phone'])
            .lean();

        // Calculate average rating for each caregiver
        for (let caregiver of caregivers) {
            const reviews = await Review.find({ caregiver: caregiver._id });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                caregiver.averageRating = totalRating / reviews.length;
                caregiver.reviewCount = reviews.length;
            } else {
                caregiver.averageRating = 0;
                caregiver.reviewCount = 0;
            }
        }

        // Sort caregivers
        if (sortBy === 'rating') {
            caregivers.sort((a, b) => b.averageRating - a.averageRating);
        } else if (sortBy === 'experience') {
            caregivers.sort((a, b) => b.experienceYears - a.experienceYears);
        } else if (sortBy === 'price') {
            caregivers.sort((a, b) => a.hourlyRate - b.hourlyRate);
        }

        res.json(caregivers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/caregivers/:id
// @desc    Get caregiver by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const caregiver = await Caregiver.findById(req.params.id)
            .populate('user', ['name', 'email', 'phone']);

        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Get reviews
        const reviews = await Review.find({ caregiver: caregiver._id })
            .populate('careSeeker', 'user')
            .populate('booking', 'service startTime');

        // Calculate average rating
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            caregiver.averageRating = totalRating / reviews.length;
            caregiver.reviewCount = reviews.length;
        }

        res.json({ caregiver, reviews });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Caregiver not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/caregivers/profile
// @desc    Update caregiver profile
// @access  Private
router.put('/profile', [auth, [
    check('bio', 'Bio is required').not().isEmpty(),
    check('services', 'At least one service is required').isArray({ min: 1 }),
    check('hourlyRate', 'Hourly rate must be a positive number').isFloat({ min: 0 }),
    check('experienceYears', 'Experience years must be a positive number').isInt({ min: 0 })
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'caregiver') {
            return res.status(403).json({ message: 'Not authorized as caregiver' });
        }

        const {
            bio,
            services,
            hourlyRate,
            experienceYears,
            availability,
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

        const caregiverFields = {
            bio,
            services,
            hourlyRate,
            experienceYears,
            availability: availability || [],
            location: location ? {
                type: 'Point',
                coordinates,
                address: location.address
            } : undefined
        };

        let caregiver = await Caregiver.findOneAndUpdate(
            { user: req.user.id },
            { $set: caregiverFields },
            { new: true }
        );

        res.json(caregiver);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/caregivers/bookings/upcoming
// @desc    Get caregiver's upcoming bookings
// @access  Private
router.get('/bookings/upcoming', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'caregiver') {
            return res.status(403).json({ message: 'Not authorized as caregiver' });
        }

        const caregiver = await Caregiver.findOne({ user: req.user.id });
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver profile not found' });
        }

        const bookings = await Booking.find({
            caregiver: caregiver._id,
            startTime: { $gt: new Date() },
            status: { $in: ['pending', 'accepted'] }
        })
        .populate('careSeeker', 'user')
        .populate('service')
        .sort({ startTime: 1 });

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 