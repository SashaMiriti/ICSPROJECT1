// File: backend/models/Caregiver.js

const mongoose = require('mongoose');

/**
 * Mongoose Schema for the Caregiver model.
 * Extends the User model with caregiver-specific fields.
 */
const CaregiverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: { type: String },
    contactNumber: { type: String },
    qualifications: [{ type: String }],
    experienceYears: { type: Number },
    specializations: [{ type: String }],
    servicesOffered: [{ type: String }],
    availability: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [{
            startTime: { type: String },
            endTime: { type: String }
        }]
    },

    // Location as GeoJSON Point
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

    // Already exists
    languagesSpoken: [{ type: String }],
    
    // NEW: If 'Tribal' selected, specify which one
    tribalLanguage: {
  type: String,
  enum: ['', 'Kikuyu', 'Luhya', 'Luo', 'Kamba', 'Kisii', 'Meru', 'Other'], // Add all tribal options you expect
  default: ''
},


    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },

    bio: { type: String },

    // ✅ NEW fields below
    specializationCategory: {
        type: String,
        enum: ['Elderly Care', 'People with Disabilities', 'Both'],
        default: ''
    },
    culture: { type: String, default: '' },
    religion: { type: String, default: '' },

    // ✅ Existing: Simple schedule field for UI input
    schedule: {
        days: { type: String, default: '' },
        time: { type: String, default: '' }
    },

    // ✅ Existing: Documents uploaded by caregiver
    documents: {
        type: [{
            filename: String,
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            }
        }],
        default: []
    },

    // ✅ Existing: Admin must verify caregiver profile
    isVerified: {
        type: Boolean,
        default: false
    },

    // Add profileComplete flag
    profileComplete: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('Caregiver', CaregiverSchema);