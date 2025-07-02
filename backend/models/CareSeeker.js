// File: backend/models/CareSeeker.js

const mongoose = require('mongoose');

/**
 * Mongoose Schema for the CareSeeker model.
 * Extends the User model with care seeker-specific fields.
 */
const CareSeekerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: { type: String },
    contactNumber: { type: String },
    careType: [{
        type: String,
        enum: ['Elderly Care', 'Child Care', 'Special Needs', 'Disability Support', 'Post-Op Recovery']
    }],
    medicalConditions: [{ type: String }],
    requiredTasks: [{ type: String }],
    caregiverGenderPreference: {
        type: String,
        enum: ['Male', 'Female', 'No Preference'],
        default: 'No Preference'
    },
    languagePreferences: [{ type: String }],
    culturalConsiderations: { type: String },
    schedule: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [{
            startTime: { type: String },
            endTime: { type: String }
        }]
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        },
        address: {
            type: String,
            required: true
        }
    },
    budget: { type: Number },
    specialNeeds: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CareSeeker', CareSeekerSchema);
