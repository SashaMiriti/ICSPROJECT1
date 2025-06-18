const mongoose = require('mongoose');

/**
 * Mongoose Schema for the Review model.
 * Represents reviews left by care seekers for caregivers after service completion.
 */
const ReviewSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    careSeeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareSeeker',
        required: true
    },
    caregiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Caregiver',
        required: true
    },
    isFlagged: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create indexes for common queries
ReviewSchema.index({ caregiver: 1 });
ReviewSchema.index({ careSeeker: 1 });
ReviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking

module.exports = mongoose.model('Review', ReviewSchema); 