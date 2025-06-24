const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const CareSeeker = require('../models/CareSeeker');

// Utility to generate token
const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password must be 6+ chars').isLength({ min: 6 }),
    check('role', 'Role must be caregiver or care seeker').isIn(['caregiver', 'care seeker', 'admin']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const {
      name,
      email,
      password,
      role,
      phone,
      bio,
      locationAddress,
      locationCoordinates,
      experienceYears,
      hourlyRate,
      services,
      specialRequirements,
      preferredServices
    } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      user = new User({ name, email, password, role, phone });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Save extended caregiver or care seeker info
      if (role === 'caregiver') {
        const caregiver = new Caregiver({
          user: user._id,
          bio: bio || '',
          experienceYears: experienceYears || 0,
          hourlyRate: hourlyRate || 0,
          services: services || [],
          location: {
            address: locationAddress || '',
            coordinates: Array.isArray(locationCoordinates) ? locationCoordinates : [0, 0],
          }
        });
        await caregiver.save();
      } else if (role === 'care seeker') {
        const careSeeker = new CareSeeker({
          user: user._id,
          specialRequirements: specialRequirements || '',
          preferredServices: preferredServices || [],
          location: {
            address: locationAddress || '',
            coordinates: Array.isArray(locationCoordinates) ? locationCoordinates : [0, 0],
          }
        });
        await careSeeker.save();
      }

      const token = generateToken(user);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

      const token = generateToken(user);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = null;
    if (user.role === 'caregiver') {
      profile = await Caregiver.findOne({ user: user._id });
    } else if (user.role === 'care seeker') {
      profile = await CareSeeker.findOne({ user: user._id });
    }

    res.json({ user, profile });
  } catch (err) {
    console.error('Fetch /me error:', err.message);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

module.exports = router;
