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

    hourlyRate: { type: Number },
    languagesSpoken: [{ type: String }],
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    bio: { type: String },

    // ✅ NEW: Documents uploaded by caregiver
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

    // ✅ NEW: Admin must verify caregiver profile
    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('Caregiver', CaregiverSchema);
