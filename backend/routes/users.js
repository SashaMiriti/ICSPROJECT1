const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const CareSeeker = require('../models/CareSeeker');

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profile;
        if (user.role === 'caregiver') {
            profile = await Caregiver.findOne({ user: user._id });
        } else if (user.role === 'care seeker') {
            profile = await CareSeeker.findOne({ user: user._id });
        }

        res.json({ user, profile });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;

        // Get user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already in use by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update user fields
        user.name = name;
        user.email = email;
        user.phone = phone;

        await user.save();

        // Return user without password
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users
// @desc    Delete user account
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete role-specific profile
        if (user.role === 'caregiver') {
            await Caregiver.findOneAndDelete({ user: user._id });
        } else if (user.role === 'care seeker') {
            await CareSeeker.findOneAndDelete({ user: user._id });
        }

        // Delete user
        await user.remove();

        res.json({ message: 'User account deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 