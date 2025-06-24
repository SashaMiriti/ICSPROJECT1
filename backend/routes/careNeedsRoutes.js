// routes/careNeedsRoutes.js
const express = require('express');
const router = express.Router();
const CareNeed = require('../models/CareNeed');
const Caregiver = require('../models/Caregiver');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/needs
 * @desc    Submit a care need and match caregivers
 * @access  Private (requires token)
 */
router.post('/needs', auth, async (req, res) => {
  try {
    const { careType, location, schedule, specialNeeds } = req.body;

    // Validate required fields
    if (!careType || !location || !schedule) {
      return res.status(400).json({ message: 'Care type, location, and schedule are required' });
    }

    // Save care need
    const careNeed = new CareNeed({
      user: req.user.id,
      careType,
      location,
      schedule,
      specialNeeds: specialNeeds || '',
    });

    await careNeed.save();

    // Match caregivers (basic filtering logic — improve as needed)
    const matchedCaregivers = await Caregiver.find({
      services: { $in: [careType] },
      'location.address': { $regex: location, $options: 'i' },
      // Add your availability logic here if modeled
    });

    res.status(201).json({
      message: 'Care need submitted successfully.',
      careNeed,
      matches: matchedCaregivers,
    });
  } catch (err) {
    console.error('❌ Error saving care need:', err);
    res.status(500).json({ message: 'Server error saving care need' });
  }
});

module.exports = router;
