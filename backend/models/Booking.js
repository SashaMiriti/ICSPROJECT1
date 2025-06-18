const mongoose = require('mongoose');

/**
 * Mongoose Schema for the Booking model.
 * Represents a booking between a caregiver and care seeker.
 */
const BookingSchema = new mongoose.Schema({
    caregiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Caregiver',
        required: true
    },
    careSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareSeeker',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    service: {
        type: String,
        required: true,
        enum: ['elderly care', 'child care', 'disability care', 'medical care', 'companionship']
    },
    notes: {
        type: String,
        required: false
    },
    location: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes for common queries
BookingSchema.index({ caregiver: 1, status: 1 });
BookingSchema.index({ careSeeker: 1, status: 1 });
BookingSchema.index({ startTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema); 