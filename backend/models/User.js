// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: { // This is crucial for distinguishing care seekers from caregivers
        type: String,
        enum: ['careSeeker', 'caregiver', 'admin'], // Ensure these roles match what you use during registration
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);