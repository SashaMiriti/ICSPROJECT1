// models/CareNeed.js

const mongoose = require('mongoose');

/**
 * CareNeed Schema
 * Represents a user's care request — includes care type, location, schedule, and optional special needs.
 */
const careNeedSchema = new mongoose.Schema(
  {
    user: { // Renamed from `userId` to `user` for consistency with common Mongoose referencing patterns
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    careType: {
      type: String,
      required: true,
      enum: ['elderly', 'special', 'child'], // Validate against accepted types
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    schedule: {
      type: String,
      required: true,
      trim: true,
    },
    specialNeeds: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model('CareNeed', careNeedSchema);
