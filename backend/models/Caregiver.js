const mongoose = require('mongoose');

/**
 * Mongoose Schema for the Caregiver model.
 * Extends the User model with caregiver-specific fields.
 */
const CaregiverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    certifications: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true,
        min: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    hourlyRate: {
        type: Number,
        required: true,
        min: 0
    },
    services: {
        type: [String],
        required: true,
        enum: ['elderly care', 'child care', 'disability care', 'medical care', 'companionship']
    },
    availability: [{
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String,
        endTime: String,
        isRecurring: {
            type: Boolean,
            default: true
        }
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});

// Create a geospatial index for location-based queries
CaregiverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Caregiver', CaregiverSchema); 