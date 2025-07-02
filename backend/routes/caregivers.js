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
            radius = 50,
            sortBy = 'rating'
        } = req.query;

        let query = { isVerified: true };

        if (services) query.services = { $in: services.split(',') };
        if (maxHourlyRate) query.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
        if (minExperience) query.experienceYears = { $gte: parseInt(minExperience) };

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
                            $maxDistance: radius * 1000
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

// ✅ Moved here to prevent Express from mistaking "profile" for an ID
// @route   GET /api/caregivers/profile
// @desc    Get caregiver profile for logged-in caregiver
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('User ID from token:', req.user.id);
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        console.log('User role:', user.role);
        if (user.role !== 'caregiver') {
            return res.status(403).json({ message: 'Not authorized as caregiver' });
        }

        const caregiver = await Caregiver.findOne({ user: user._id }).populate('user', ['name', 'email']);
        if (!caregiver) {
            console.log('No caregiver profile found for user:', user._id);
            return res.status(404).json({ message: 'Caregiver profile not found' });
        }

        console.log('Returning caregiver profile:', caregiver._id);
        res.json(caregiver);
    } catch (err) {
        console.error('Error fetching caregiver profile:', err.message);
        res.status(500).json({ message: 'Server error while fetching caregiver profile' });
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

        const reviews = await Review.find({ caregiver: caregiver._id })
            .populate('careSeeker', 'user')
            .populate('booking', 'service startTime');

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

// @route   GET /api/caregivers/reviews
// @desc    Get caregiver's reviews
// @access  Private
router.get('/reviews', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'caregiver') {
            return res.status(403).json({ message: 'Not authorized as caregiver' });
        }

        const caregiver = await Caregiver.findOne({ user: req.user.id });
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver profile not found' });
        }

        const reviews = await Review.find({ caregiver: caregiver._id })
            .populate({
                path: 'careSeeker',
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

// @route   GET /api/caregivers/:id/reviews
// @desc    Get reviews for a specific caregiver (public)
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    try {
        const caregiver = await Caregiver.findById(req.params.id);
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        const reviews = await Review.find({ caregiver: caregiver._id })
            .populate({
                path: 'careSeeker',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .populate('booking', 'service startTime')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Caregiver not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
