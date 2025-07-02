// backend/controllers/caregiverController.js
const Caregiver = require('../models/Caregiver');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Update caregiver schedule
// @route   PUT /api/caregivers/schedule
// @access  Private (caregiver only)
exports.updateSchedule = async (req, res, next) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user.id });

    if (!caregiver) {
      return next(new ErrorResponse('Caregiver not found', 404));
    }

    caregiver.schedule = {
      days: req.body.days,
      time: req.body.time,
    };

    await caregiver.save();

    res.status(200).json({ success: true, message: 'Schedule updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get caregiver profile
// @route   GET /api/caregivers/profile
// @access  Private (caregiver only)
exports.getCaregiverProfile = async (req, res, next) => {
  try {
    const caregiver = await Caregiver.findOne({ user: req.user.id }).populate('user', ['email', 'username']);

    if (!caregiver) {
      return next(new ErrorResponse('Caregiver profile not found', 404));
    }

    // Flatten the response to include email and username at the top level
    const caregiverObj = caregiver.toObject();
    caregiverObj.email = caregiver.user?.email || '';
    caregiverObj.username = caregiver.user?.username || '';
    delete caregiverObj.user; // Optional: remove the nested user object

    res.status(200).json(caregiverObj);
  } catch (error) {
    next(error);
  }
};
