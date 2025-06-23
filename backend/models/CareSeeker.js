const mongoose = require('mongoose');

/**
 * Mongoose Schema for the CareSeeker model.
 * Extends the User model with care seeker-specific fields.
 */
const CareSeekerSchema = new mongoose.Schema({
    user: { // This links the care seeker profile to a general user account
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // A user can only have one care seeker profile
    },
    fullName: { type: String }, // e.g., "Steve Careseeker" - it's fine if this is duplicated from User, or only lives here
    contactNumber: { type: String },
    careType: [{ // e.g., ['Elderly Care', 'Child Care', 'Special Needs']
        type: String,
        enum: ['Elderly Care', 'Child Care', 'Special Needs', 'Disability Support', 'Post-Op Recovery']
    }],
    medicalConditions: [{ // e.g., ['Diabetes', 'Mobility Impairment']
        type: String
    }],
    requiredTasks: [{ // e.g., ['Meal Prep', 'Bathing Assistance', 'Medication Reminders', 'Transportation']
        type: String
    }],
    caregiverGenderPreference: {
        type: String,
        enum: ['Male', 'Female', 'No Preference'],
        default: 'No Preference'
    },
    languagePreferences: [{ // e.g., ['English', 'Swahili', 'Luo']
        type: String
    }],
    culturalConsiderations: {
        type: String // Free text for specific cultural needs
    },
    schedule: { // Desired care schedule
        days: [{ // e.g., ['Monday', 'Wednesday', 'Friday']
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [{
            startTime: { type: String }, // e.g., "09:00"
            endTime: { type: String }    // e.g., "13:00"
        }]
    },
    // --- CRITICAL FIX: Define location as GeoJSON Point type ---
    location: { // Where care is needed (e.g., home address)
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
    budget: { type: Number }, // Optional: hourly or daily budget
}, { timestamps: true });

module.exports = mongoose.model('CareSeeker', CareSeekerSchema);
