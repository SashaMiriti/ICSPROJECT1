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
    // --- CRITICAL FIX: Define location as GeoJSON Point type ---
    location: {
        type: {
            type: String, // Must be 'Point' for GeoJSON Point
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]
            required: true,
            index: '2dsphere' // This creates the geospatial index in MongoDB
        },
        address: { // You can store the address string as a custom property within the GeoJSON object
            type: String,
            required: true // Making it required based on your validation
        }
    },
    // --- END CRITICAL FIX ---
    hourlyRate: { type: Number },
    languagesSpoken: [{ type: String }],
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    bio: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Caregiver', CaregiverSchema);
