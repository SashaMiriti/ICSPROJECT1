const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const sendEmail = require('../utils/sendEmail');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ✅ Updated reusable formatting function — includes `documents`
const formatCaregiverData = (user, profile) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  status: user.status,
  bio: profile?.bio || '',
  location: typeof profile?.location === 'string'
    ? profile.location
    : profile?.location?.address || '',
  documents: profile?.documents?.map(doc => ({
    filename: `${doc.filename.replace(/\\/g, '/')}`,
    status: doc.status
  })) || []
});

// ✅ Get all pending caregivers
router.get('/pending-caregivers', async (req, res) => {
  try {
    const pendingUsers = await User.find({ role: 'caregiver', status: 'pending' }).select('-password');
    const caregiverProfiles = await Caregiver.find({ user: { $in: pendingUsers.map(u => u._id) } });

    const combined = pendingUsers.map(user => {
      const profile = caregiverProfiles.find(cp => cp.user.toString() === user._id.toString());
      return formatCaregiverData(user, profile);
    });

    res.json(combined);
  } catch (error) {
    console.error('Error fetching pending caregivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get specific caregiver by ID
router.get('/caregiver/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'caregiver') {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const profile = await Caregiver.findOne({ user: user._id });
    return res.json(formatCaregiverData(user, profile));
  } catch (error) {
    console.error('Error fetching caregiver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Approve caregiver and send email
router.put('/approve-caregiver/:id', async (req, res) => {
  try {
    const caregiver = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (caregiver && caregiver.email) {
      await sendEmail({
        to: caregiver.email,
        subject: 'TogetherCare Approval Notification ✅',
        html: `
          <p>Hello <strong>${caregiver.username}</strong>,</p>
          <p>Your caregiver application has been <b style="color:green">approved</b>!</p>
          <p>You can now <a href="http://localhost:3000/login">log in</a> to your TogetherCare account using your credentials.</p>
          <p>Thank you for joining us!</p>
          <p style="margin-top:20px">— TogetherCare Admin Team</p>
        `
      });
    }

    res.json({ message: 'Caregiver approved and notified via email ✅', caregiver });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject caregiver and send email
router.put('/reject-caregiver/:id', async (req, res) => {
  try {
    const caregiver = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (caregiver && caregiver.email) {
      await sendEmail({
        to: caregiver.email,
        subject: 'TogetherCare Application Status ❌',
        html: `
          <p>Hello <strong>${caregiver.username}</strong>,</p>
          <p>We regret to inform you that your caregiver application has been <b style="color:red">rejected</b> at this time.</p>
          <p>If you believe this was a mistake or would like to apply again, please contact support or visit our site again in the future.</p>
          <p style="margin-top:20px">— TogetherCare Admin Team</p>
        `
      });
    }

    res.json({ message: 'Caregiver rejected and notified via email ❌', caregiver });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
