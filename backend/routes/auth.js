const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult, body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const CareSeeker = require('../models/CareSeeker');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const authMiddleware = require('../middleware/auth');

<<<<<<< HEAD
const JWT_SECRET = process.env.JWT_SECRET;

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/certifications/';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed.'));
    }
  }
});

// ✅ GET current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ LOGIN
router.post('/login', [
  body('email', 'Valid email required').isEmail(),
  body('password', 'Password required').exists(),
  body('role', 'Role must be careSeeker, caregiver, or admin').isIn(['careSeeker', 'caregiver', 'admin']),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== role) {
      return next(new ErrorResponse('Invalid email or role', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (role === 'caregiver') {
  if (user.status !== 'approved') {
    return res.status(403).json({
      message: 'Caregiver not yet approved by admin',
      user: { username: user.username }
    });
  }
}


    const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return next(new ErrorResponse('Server error during login', 500));
  }
});

// ✅ REGISTER
router.post(
  '/register',
  upload.single('certification'),
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['careSeeker', 'caregiver', 'admin']).withMessage('Invalid role'),
    body('phone').isLength({ min: 10, max: 10 }).isNumeric().withMessage('Phone must be 10 digits'),
    body('bio').custom((value, { req }) => {
      if (req.body.role === 'caregiver' && (!value || value.trim() === '')) {
        throw new Error('Bio is required for caregivers');
      }
      return true;
    }),
    body('locationAddress', 'Location address is required').if(body('role').isIn(['caregiver', 'careSeeker'])).notEmpty(),
    body('locationCoordinates', 'Location coordinates must be valid').custom((value) => {
      const coords = JSON.parse(value);
      if (!Array.isArray(coords) || coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        throw new Error('Invalid coordinates');
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const {
        username,
        email,
        password,
        role,
        phone,
        bio,
        locationAddress,
        locationCoordinates
      } = req.body;

      const coords = JSON.parse(locationCoordinates);

      let existingUser = await User.findOne({ email });
      if (existingUser) return next(new ErrorResponse('Email already exists', 400));

      existingUser = await User.findOne({ username });
      if (existingUser) return next(new ErrorResponse('Username already taken', 400));

      const user = new User({
        username,
        email,
        password,
        role,
        phone,
        status: role === 'caregiver' ? 'pending' : 'active'
      });
      await user.save();

      const geoJsonLocation = {
        type: 'Point',
        coordinates: [coords[0], coords[1]],
        address: locationAddress
      };

      if (role === 'careSeeker') {
        await new CareSeeker({
          user: user._id,
          fullName: username,
          contactNumber: phone,
          location: geoJsonLocation
        }).save();
      } else if (role === 'caregiver') {
        await new Caregiver({
          user: user._id,
          fullName: username,
          contactNumber: phone,
          bio,
          location: geoJsonLocation,
          documents: req.file
            ? [{ filename: path.join('certifications', req.file.filename), status: 'pending' }]
            : [],
          applicationStatus: 'pending'
        }).save();
      }

      const token = jwt.sign({ user: { id: user._id } }, JWT_SECRET, { expiresIn: '30d' });

      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      next(new ErrorResponse('Server error during registration', 500));
    }
  }
);
=======
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
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d

module.exports = router;
