const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
    console.log('🔍 Email submitted:', email);
    console.log('🧾 Role submitted:', role);
    console.log('🗃️ Found user role:', user?.role);

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
  upload.array('certifications'),
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
        locationCoordinates,
        specializationCategory
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
        // Handle multiple file uploads
        let documents = [];
        if (req.files && req.files.length > 0) {
          documents = req.files.map(file => ({
            filename: path.join('certifications', file.filename),
            status: 'pending'
          }));
        }
        await new Caregiver({
          user: user._id,
          fullName: username,
          contactNumber: phone,
          bio,
          location: geoJsonLocation,
          specializationCategory,
          documents,
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

// ✅ FORGOT PASSWORD
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

   const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click to reset: ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message
    });

    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return next(new ErrorResponse('Error sending reset email', 500));
  }
});
// ✅ RESET PASSWORD
router.put('/reset-password/:token', async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Hash and save new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    next(new ErrorResponse('Server error during password reset', 500));
  }
});

module.exports = router;
