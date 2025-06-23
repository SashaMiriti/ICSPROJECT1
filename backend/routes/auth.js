// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Ensure auth middleware is imported

// Models
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');   // For creating caregiver profiles
const CareSeeker = require('../models/CareSeeker'); // For creating care seeker profiles

// @route   POST api/auth/register
// @desc    Register user & specific profile
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required and must be either careSeeker or caregiver').isIn(['careSeeker', 'caregiver', 'admin']),
    check('phone', 'Phone number must be 10 digits').isLength({ min: 10, max: 10 }).isNumeric(),
    check('bio', 'Bio is required for caregivers').if(check('role').equals('caregiver')).not().isEmpty(),

    // Validation for locationAddress and locationCoordinates.
    // Frontend is sending locationAddress and locationCoordinates as top-level fields.
    check('locationAddress', 'Location address is required').if(check('role').isIn(['caregiver', 'careSeeker'])).trim().not().isEmpty(),
    check('locationCoordinates', 'Location coordinates are required and must be an array of 2 numbers').if(check('role').isIn(['caregiver', 'careSeeker'])).isArray({ min: 2, max: 2 }),
    check('locationCoordinates.0', 'Longitude must be a number').if(check('role').isIn(['caregiver', 'careSeeker'])).isFloat(),
    check('locationCoordinates.1', 'Latitude must be a number').if(check('role').isIn(['caregiver', 'careSeeker'])).isFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors during registration:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, phone, bio, locationAddress, locationCoordinates } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      user = await User.findOne({ username });
      if (user) {
          return res.status(400).json({ message: 'Username already taken' });
      }

      user = new User({
        username,
        email,
        password,
        role,
        phone
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      let specificProfile = null;

      // --- CRITICAL FIX: Construct GeoJSON location object ---
      // This structure is required by MongoDB if you have a 2dsphere index on 'location'
      const geoJsonLocation = {
          type: "Point", // Required for GeoJSON Point type
          // GeoJSON coordinates array is always [longitude, latitude]
          coordinates: [
              (locationCoordinates && typeof locationCoordinates[0] === 'number') ? locationCoordinates[0] : 0, // Longitude
              (locationCoordinates && typeof locationCoordinates[1] === 'number') ? locationCoordinates[1] : 0  // Latitude
          ],
          // You can still store the address string as a custom field within the location object
          address: locationAddress || '' 
      };
      // --- END CRITICAL FIX ---


      if (role === 'careSeeker') {
          specificProfile = new CareSeeker({
              user: user._id,
              fullName: username,
              contactNumber: phone,
              location: geoJsonLocation // Use the new GeoJSON location object
          });
          await specificProfile.save();
      } else if (role === 'caregiver') {
          specificProfile = new Caregiver({
              user: user._id,
              fullName: username,
              contactNumber: phone,
              bio: bio || '',
              location: geoJsonLocation // Use the new GeoJSON location object
          });
          await specificProfile.save();
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Consistent with frontend AuthContext
        (err, token) => {
          if (err) throw err;
          // Send back token and the full user object (including username and role)
          res.json({
            token,
            user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error('Server error during registration:', err.message);
      // Log the full error object for more detail during development
      if (process.env.NODE_ENV === 'development') {
          console.error(err);
      }
      if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(el => el.message);
          return res.status(400).json({ message: 'Validation Error', errors: errors });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Consistent with AuthContext
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: { // Ensure full user object is returned here
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }
      );
    } catch (err) {
      console.error('Server error during login:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user (by token)
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Return just the user object
  } catch (err) {
    console.error('Server error fetching user profile:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
