const mongoose = require('mongoose');

/**
 * Mongoose Schema for the Item model.
 * This is the basic item structure from your previous setup,
 * now moved into its own module for better organization.
 */
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    // Using default Mongoose timestamps for 'createdAt' and 'updatedAt'
    // instead of a single 'date' field, for consistency and flexibility.
    // This will align with the timestamp fields implicitly for generic items.
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the Item model, which will be used to interact with the 'items' collection
module.exports = mongoose.model('Item', itemSchema);
