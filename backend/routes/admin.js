const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const sendEmail = require('../utils/sendEmail');
const CareSeeker = require('../models/CareSeeker');
const Booking = require('../models/Booking');

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
    // Fetch all caregivers whose isVerified is false
    const pendingCaregivers = await Caregiver.find({ isVerified: false }).populate('user');
    // Format the data to include both user and caregiver profile info
    const combined = pendingCaregivers.map(profile => {
      const user = profile.user;
      return {
        _id: user?._id,
        username: user?.username,
        email: user?.email,
        phone: user?.phone,
        status: user?.status,
        bio: profile.bio || '',
        location: typeof profile.location === 'string' ? profile.location : profile.location?.address || '',
        documents: profile.documents?.map(doc => ({
          filename: `${doc.filename.replace(/\\/g, '/')}`,
          status: doc.status
        })) || [],
        specializationCategory: profile.specializationCategory,
        isVerified: profile.isVerified,
        profileComplete: profile.profileComplete
      };
    });
    res.json(combined);
  } catch (error) {
    console.error('Error fetching pending caregivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get specific caregiver by ID with full details
router.get('/caregiver/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'caregiver') {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const profile = await Caregiver.findOne({ user: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }

    // Return comprehensive caregiver data
    const caregiverData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      // Profile information
      fullName: profile.fullName,
      contactNumber: profile.contactNumber,
      bio: profile.bio,
      experienceYears: profile.experienceYears,
      specializationCategory: profile.specializationCategory,
      languagesSpoken: profile.languagesSpoken,
      tribalLanguage: profile.tribalLanguage,
      gender: profile.gender,
      culture: profile.culture,
      religion: profile.religion,
      qualifications: profile.qualifications,
      servicesOffered: profile.servicesOffered,
      // Location
      location: profile.location,
      // Pricing
      hourlyRate: profile.hourlyRate,
      priceType: profile.priceType,
      // Availability
      availability: profile.availability,
      // Verification status
      isVerified: profile.isVerified,
      profileComplete: profile.profileComplete,
      // Documents
      documents: profile.documents?.map(doc => ({
        filename: `${doc.filename.replace(/\\/g, '/')}`,
        status: doc.status
      })) || [],
      // Timestamps
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };

    return res.json(caregiverData);
  } catch (error) {
    console.error('Error fetching caregiver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Approve caregiver and send email
router.put('/approve-caregiver/:id', async (req, res) => {
  try {

    // Update User status to approved
    const caregiver = await User.findByIdAndUpdate(

      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    // Update Caregiver isVerified to true
    await Caregiver.findOneAndUpdate(
      { user: req.params.id },
      { isVerified: true },
      { new: true }
    );

    if (caregiver && caregiver.email) {

      await sendEmail({
        to: caregiverUser.email,
        subject: 'TogetherCare Approval Notification ✅',
        html: `
          <p>Hello <strong>${caregiverUser.username}</strong>,</p>
          <p>Your caregiver application has been <b style="color:green">approved</b>!</p>
          <p>You can now <a href="http://localhost:3000/login">log in</a> to your TogetherCare account using your credentials.</p>
          <p>Thank you for joining us!</p>
          <p style="margin-top:20px">— TogetherCare Admin Team</p>
        `
      });
    }

    res.json({ message: 'Caregiver approved and notified via email ✅', caregiver: caregiverUser });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject caregiver and send email
router.put('/reject-caregiver/:id', async (req, res) => {
  try {
    // Update User status to rejected
    const caregiver = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    // Update Caregiver isVerified to false
    await Caregiver.findOneAndUpdate(
      { user: req.params.id },
      { isVerified: false },
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

// ✅ Toggle caregiver verification status
router.put('/toggle-verification/:id', async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    // Update the caregiver profile verification status
    const updatedProfile = await Caregiver.findOneAndUpdate(
      { user: req.params.id },
      { isVerified: isVerified },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }

    // Also update user status to match verification
    const userStatus = isVerified ? 'approved' : 'pending';
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: userStatus },
      { new: true }
    );

    // Send email notification
    if (updatedUser && updatedUser.email) {
      const subject = isVerified 
        ? 'TogetherCare Verification Approved ✅' 
        : 'TogetherCare Verification Removed ⚠️';
      
      const html = isVerified 
        ? `
          <p>Hello <strong>${updatedUser.username}</strong>,</p>
          <p>Your caregiver profile has been <b style="color:green">verified</b>!</p>
          <p>You can now <a href="http://localhost:3000/login">log in</a> to your TogetherCare account and start receiving bookings.</p>
          <p>Thank you for joining us!</p>
          <p style="margin-top:20px">— TogetherCare Admin Team</p>
        `
        : `
          <p>Hello <strong>${updatedUser.username}</strong>,</p>
          <p>Your caregiver profile verification has been <b style="color:orange">removed</b>.</p>
          <p>You may need to provide additional documentation or information to be verified again.</p>
          <p>Please contact support if you have any questions.</p>
          <p style="margin-top:20px">— TogetherCare Admin Team</p>
        `;

      await sendEmail({
        to: updatedUser.email,
        subject: subject,
        html: html
      });
    }

    res.json({ 
      message: `Caregiver verification ${isVerified ? 'approved' : 'removed'} successfully`, 
      caregiver: updatedProfile,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/statistics
// @desc    Get admin dashboard statistics
// @access  Private (admin)
router.get('/statistics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    // Import additional models
    const Review = require('../models/Review');
    const Item = require('../models/Item');
    const CareNeed = require('../models/CareNeed');
    
    const totalUsers = await User.countDocuments();
    const totalCareSeekers = await CareSeeker.countDocuments();
    const totalCaregivers = await Caregiver.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const approvedBookings = await Booking.countDocuments({ status: 'accepted' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalReviews = await Review.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalCareNeeds = await CareNeed.countDocuments();
    
    res.json({
      totalUsers,
      totalCareSeekers,
      totalCaregivers,
      totalBookings,
      approvedBookings,
      pendingBookings,
      cancelledBookings,
      totalReviews,
      totalItems,
      totalCareNeeds
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/care-seekers
// @desc    Get all care seekers with user info
// @access  Private (admin)
router.get('/care-seekers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const careSeekers = await CareSeeker.find().populate('user', 'email');
    res.json(careSeekers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/care-seekers/:id
// @desc    Get a single care seeker with user info
// @access  Private (admin)
router.get('/care-seekers/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const careSeeker = await CareSeeker.findById(req.params.id).populate('user', 'email');
    if (!careSeeker) return res.status(404).json({ message: 'Care seeker not found' });
    res.json(careSeeker);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/care-seekers/:id/bookings
// @desc    Get all bookings for a care seeker
// @access  Private (admin)
router.get('/care-seekers/:id/bookings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const bookings = await Booking.find({ careSeeker: req.params.id })
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name' }
      });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/care-seekers/:id
// @desc    Delete a care seeker, their user, and bookings
// @access  Private (admin)
router.delete('/care-seekers/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const careSeeker = await CareSeeker.findById(req.params.id);
    if (!careSeeker) return res.status(404).json({ message: 'Care seeker not found' });
    // Delete all bookings for this care seeker
    await Booking.deleteMany({ careSeeker: careSeeker._id });
    // Delete the user account
    await User.findByIdAndDelete(careSeeker.user);
    // Delete the care seeker profile
    await CareSeeker.findByIdAndDelete(req.params.id);
    res.json({ message: 'Care seeker and related data deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (admin)
router.get('/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/caregivers
// @desc    Get all caregivers with user info
// @access  Private (admin)
router.get('/caregivers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const caregivers = await Caregiver.find().populate('user', 'email username phone');
    res.json(caregivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filtering
// @access  Private (admin)
router.get('/bookings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'careSeeker',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews
// @access  Private (admin)
router.get('/reviews', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const Review = require('../models/Review');
    const reviews = await Review.find()
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'careSeeker',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('booking')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/items
// @desc    Get all items
// @access  Private (admin)
router.get('/items', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const Item = require('../models/Item');
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/care-needs
// @desc    Get all care needs
// @access  Private (admin)
router.get('/care-needs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const CareNeed = require('../models/CareNeed');
    const careNeeds = await CareNeed.find()
      .populate('careSeeker', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(careNeeds);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
