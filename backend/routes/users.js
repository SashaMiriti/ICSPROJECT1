const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const CareSeeker = require('../models/CareSeeker');

// @route   PUT /api/users/profile
// @desc    Update user profile (basic user info AND role-specific profile)
// @access  Private
router.put('/profile', [auth, [
    // Adjust validation based on what you expect to be updated on the profile
    check('fullName', 'Full Name is required for profile update').not().isEmpty(), // Now on CareSeeker/Caregiver
    check('email', 'Please include a valid email').isEmail().optional() // Make email optional for profile update if not always provided
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure fields from req.body
    const {
        // User model fields (basic info - email/password updates handled below)
        email,
        phone, // Assuming phone is on the User model
        currentPassword,
        newPassword,

        // Care Seeker specific fields (will go into CareSeeker model)
        fullName, contactNumber, careType, medicalConditions, requiredTasks,
        caregiverGenderPreference, languagePreferences, culturalConsiderations,
        schedule, location, budget,

        // Caregiver specific fields (if you expand this route to handle caregivers too)
        // qualifications, experienceYears, specializations, servicesOffered,
        // availability, hourlyRate, languagesSpoken, gender, bio
    } = req.body;

    try {
        // 1. Fetch the main User document
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Handle email update on User model
        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            // Ensure the email is not already in use by a *different* user
            if (existingUserWithEmail && String(existingUserWithEmail._id) !== String(req.user.id)) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
            user.email = email; // Update user's email
        }

        // 3. Handle password update on User model
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

        // Update other basic user fields if they are on the User model
        // Example: if 'phone' is on the User model
        if (phone !== undefined) user.phone = phone;

        await user.save(); // Save changes to the main User model


        // 4. Update the Role-Specific Profile (CareSeeker or Caregiver)
        let specificProfile;
        if (user.role === 'careSeeker') {
            specificProfile = await CareSeeker.findOne({ user: req.user.id });

            // If a care seeker profile doesn't exist, create it (important for users registered before this logic)
            if (!specificProfile) {
                specificProfile = new CareSeeker({ user: req.user.id });
            }

            // Update Care Seeker specific fields (only if provided in req.body)
            if (fullName !== undefined) specificProfile.fullName = fullName;
            if (contactNumber !== undefined) specificProfile.contactNumber = contactNumber;
            if (careType !== undefined) specificProfile.careType = careType;
            if (medicalConditions !== undefined) specificProfile.medicalConditions = medicalConditions;
            if (requiredTasks !== undefined) specificProfile.requiredTasks = requiredTasks;
            if (caregiverGenderPreference !== undefined) specificProfile.caregiverGenderPreference = caregiverGenderPreference;
            if (languagePreferences !== undefined) specificProfile.languagePreferences = languagePreferences;
            if (culturalConsiderations !== undefined) specificProfile.culturalConsiderations = culturalConsiderations;
            if (schedule !== undefined) specificProfile.schedule = schedule;
            if (location !== undefined) specificProfile.location = location;
            if (budget !== undefined) specificProfile.budget = budget;

            await specificProfile.save(); // Save changes to the CareSeeker profile

        } else if (user.role === 'caregiver') {
            specificProfile = await Caregiver.findOne({ user: req.user.id });

            // If a caregiver profile doesn't exist, create it
            if (!specificProfile) {
                specificProfile = new Caregiver({ user: req.user.id });
            }

            // TODO: Add logic here to update Caregiver specific fields if they are provided in req.body
            // Example (uncomment and fill based on your Caregiver model fields):
            /*
            if (req.body.fullName !== undefined) specificProfile.fullName = req.body.fullName;
            if (req.body.contactNumber !== undefined) specificProfile.contactNumber = req.body.contactNumber;
            if (req.body.qualifications !== undefined) specificProfile.qualifications = req.body.qualifications;
            if (req.body.experienceYears !== undefined) specificProfile.experienceYears = req.body.experienceYears;
            // ... and so on for all caregiver specific fields
            */

            await specificProfile.save(); // Save changes to the Caregiver profile
        }

        // 5. Return updated user and their specific profile to the frontend
        const updatedUser = await User.findById(user._id).select('-password');
        res.json({ user: updatedUser, specificProfile });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ errors: errors.join(', ') });
        }
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
        } else if (user.role === 'careSeeker') { // <--- ENSURE THIS IS 'careSeeker'
            await CareSeeker.findOneAndDelete({ user: user._id });
        }

        // Delete user
        await User.findByIdAndDelete(req.user.id); // <--- Recommended replacement for user.remove()

        res.json({ message: 'User account deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 