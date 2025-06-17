const mongoose = require('mongoose');

/**
 * Mongoose Schema for the User model.
 * Defines the structure and validation rules for user documents in MongoDB,
 * aligning with the 'Users Table' in Chapter 4.
 */
const UserSchema = new mongoose.Schema({
    // 'name' attribute from Users Table, replaces previous 'username'
    name: {
        type: String,
        required: true,
        trim: true // Removes whitespace from both ends of a string
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures each email is unique
        trim: true,
        lowercase: true, // Stores email in lowercase for consistency
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email format validation
    },
    // 'password' attribute for storing the hashed password
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length (as per previous setup)
    },
    // 'phone' attribute from Users Table
    phone: {
        type: String,
        required: false, // As per your Users Table, phone is optional
        trim: true
    },
    // 'role' attribute from Users Table with ENUM values
    role: {
        type: String,
        enum: ['caregiver', 'care seeker', 'admin'], // Ensures role is one of these specific values
        required: true
    }
}, {
    // Mongoose option to automatically add 'createdAt' and 'updatedAt' timestamps
    // This aligns with 'created_at' and 'updated_at' in your Users Table
    timestamps: true
});

// Export the User model, which will be used to interact with the 'users' collection
module.exports = mongoose.model('User', UserSchema);
