const mongoose = require('mongoose');

/**
 * Mongoose Schema for the CareSeeker model.
 * Extends the User model with care seeker-specific fields.
 */
const CareSeekerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    },
    specialRequirements: {
        type: String,
        required: false
    },
    preferredServices: {
        type: [String],
        required: true,
        enum: ['elderly care', 'child care', 'disability care', 'medical care', 'companionship']
    },
    preferences: {
        gender: {
            type: String,
            enum: ['male', 'female', 'no preference'],
            default: 'no preference'
        },
        minExperience: {
            type: Number,
            default: 0
        },
        maxHourlyRate: {
            type: Number,
            required: false
        }
    }
}, {
    timestamps: true
});

// Create a geospatial index for location-based queries
CareSeekerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CareSeeker', CareSeekerSchema); 