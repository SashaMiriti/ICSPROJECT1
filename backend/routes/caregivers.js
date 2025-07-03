const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const NodeGeocoder = require('node-geocoder');
const mongoose = require('mongoose');
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

        // Find all caregivers where either isVerified is true OR user.status is 'approved'
        const caregivers = await Caregiver.find()
            .populate('user', ['name', 'email', 'status'])
            .lean();

        // Filter for verified caregivers (either isVerified or user.status === 'approved')
        const verifiedCaregivers = caregivers.filter(cg => cg.isVerified === true || (cg.user && cg.user.status === 'approved'));

        let filtered = verifiedCaregivers;
        if (services) filtered = filtered.filter(cg => cg.services && cg.services.includes(services));
        if (maxHourlyRate) filtered = filtered.filter(cg => cg.hourlyRate && cg.hourlyRate <= parseFloat(maxHourlyRate));
        if (minExperience) filtered = filtered.filter(cg => cg.experienceYears && cg.experienceYears >= parseInt(minExperience));

        if (location) {
            try {
                const geoResults = await geocoder.geocode(location);
                if (geoResults.length > 0) {
                    const { latitude, longitude } = geoResults[0];
                    filtered = filtered.filter(cg => {
                        if (cg.location) {
                            const distance = Math.sqrt(
                                Math.pow(cg.location.coordinates[0] - longitude, 2) +
                                Math.pow(cg.location.coordinates[1] - latitude, 2)
                            );
                            return distance <= radius * 1000;
                        }
                        return true;
                    });
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            }
        }

        for (let caregiver of filtered) {
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
            filtered.sort((a, b) => b.averageRating - a.averageRating);
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => b.experienceYears - a.experienceYears);
        } else if (sortBy === 'price') {
            filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
        }

        res.json(filtered);
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
// GET caregiver by user ID
router.get('/user/:userId', async (req, res) => {
  try {

    const caregiver = await Caregiver.findOne({ user: req.params.userId }).populate('user', ['fullName', 'email']);
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    res.json(caregiver);
  } catch (err) {
    console.error('❌ Error fetching caregiver by user ID:', err);
     res.status(500).json({ message: 'Server error while fetching caregiver by user ID', error: err.message });
  }
});
// @route   GET /api/caregivers/:id
// @desc    Get caregiver by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const caregiver = await Caregiver.findById(req.params.id)
            .populate('user', ['name', 'email', 'status']);

        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Consider verified if either isVerified or user.status === 'approved'
        const isVerified = caregiver.isVerified === true || (caregiver.user && caregiver.user.status === 'approved');
        const reviews = await Review.find({ caregiver: caregiver._id })
            .populate('careSeeker', 'user')
            .populate('booking', 'service startTime');

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            caregiver.averageRating = totalRating / reviews.length;
            caregiver.reviewCount = reviews.length;
        }

        res.json({ caregiver: { ...caregiver.toObject(), isVerified }, reviews });
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
router.put('/profile', auth, async (req, res) => {
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
// @route   PUT /api/caregivers/schedule
// @desc    Update caregiver schedule
// @access  Private
router.put('/schedule', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'caregiver') {
            return res.status(403).json({ message: 'Not authorized as caregiver' });
        }

        const caregiver = await Caregiver.findOne({ user: user._id });
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Save to availability instead of schedule
        caregiver.availability = {
          days: req.body.days,
          timeSlots: [{ startTime: req.body.time.startTime, endTime: req.body.time.endTime }]
        };

        await caregiver.save();

        res.status(200).json({ success: true, message: 'Schedule updated' });
    } catch (err) {
        console.error('Error updating schedule:', err.message);
        res.status(500).json({ message: 'Server error while updating schedule' });
    }
});
// @route   PUT /api/caregivers/:id
// @desc    Update full caregiver profile (first-time completion)
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const caregiver = await Caregiver.findById(req.params.id);
        if (!caregiver) {
            return res.status(404).json({ message: 'Caregiver not found' });
        }

        // Optional: Ensure the logged-in user is updating their own profile
        if (caregiver.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        // Update allowed fields
        const allowedFields = [
  'fullName',
  'contactNumber',
  'bio',
  'experienceYears',
  'specializationCategory',
  'languagesSpoken',
  'tribalLanguage',
  'gender',
  'culture',
  'religion', 
];
console.log('🔍 Incoming caregiver update fields:', req.body);
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                caregiver[field] = req.body[field];
            }
        });

        // Check if all required fields are present to set profileComplete
        const requiredFields = [
          'fullName',
          'contactNumber',
          'bio',
          'experienceYears',
          'specializationCategory',
          'languagesSpoken',
          'gender',
          'culture',
          'religion'
        ];
        const isComplete = requiredFields.every(field => {
          const val = caregiver[field];
          if (Array.isArray(val)) return val.length > 0;
          return val !== undefined && val !== null && val !== '';
        });
        caregiver.profileComplete = isComplete;

        await caregiver.save();
        res.status(200).json({ success: true, caregiver });

    } catch (err) {
        console.error('❌ Error updating caregiver profile:', err);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

// @route   GET /api/caregivers/:id/reviews
// @desc    Get reviews for a caregiver
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
