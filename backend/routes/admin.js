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

// Helper for pagination
function getPaginationParams(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// ✅ Get all pending caregivers with comprehensive details
router.get('/pending-caregivers', auth, async (req, res) => {
  try {
    // Check admin authorization
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

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
        // Profile information
        fullName: profile.fullName,
        contactNumber: profile.contactNumber,
        bio: profile.bio || '',
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
        location: typeof profile.location === 'string' ? profile.location : profile.location?.address || '',
        // Pricing
        hourlyRate: profile.hourlyRate,
        priceType: profile.priceType,
        // Availability
        availability: profile.availability,
        schedule: profile.schedule,
        // Documents with full details
        documents: profile.documents?.map(doc => ({
          filename: `${doc.filename.replace(/\\/g, '/')}`,
          status: doc.status,
          originalName: doc.originalName || doc.filename.split('/').pop(),
          url: `${BASE_URL}/uploads/certifications/${doc.filename.replace(/\\/g, '/').split('/').pop()}`
        })) || [],
        // Verification status
        isVerified: profile.isVerified,
        profileComplete: profile.profileComplete,
        // Timestamps
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        userCreatedAt: user?.createdAt
      };
    });
    res.json(combined);
  } catch (error) {
    console.error('Error fetching pending caregivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get specific caregiver by ID with full details
router.get('/caregiver/:id', auth, async (req, res) => {
  try {
    // Check admin authorization
    const adminUser = await User.findById(req.user.id);
    if (adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'caregiver') {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    const profile = await Caregiver.findOne({ user: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }

    // Return comprehensive caregiver data with all registration details
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
      schedule: profile.schedule,
      // Verification status
      isVerified: profile.isVerified,
      profileComplete: profile.profileComplete,
      // Documents with full path for admin access
      documents: profile.documents?.map(doc => ({
        filename: `${doc.filename.replace(/\\/g, '/')}`,
        status: doc.status,
        originalName: doc.originalName || doc.filename.split('/').pop(),
        url: `${BASE_URL}/uploads/certifications/${doc.filename.replace(/\\/g, '/').split('/').pop()}`
      })) || [],
      // Timestamps
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      // User registration date
      userCreatedAt: user.createdAt
    };

    return res.json(caregiverData);
  } catch (error) {
    console.error('Error fetching caregiver details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Approve caregiver and send email
router.put('/approve-caregiver/:id', auth, async (req, res) => {
  try {
    // Check admin authorization
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Approve the user (set status: 'approved')
    const caregiverUser = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    // Also set isVerified: true and profileComplete: true on the Caregiver profile
    await Caregiver.findOneAndUpdate(
      { user: req.params.id },
      { isVerified: true, profileComplete: true }
    );

    if (caregiverUser && caregiverUser.email) {
      try {
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
      } catch (emailError) {
        console.error('Email notification failed, but approval was successful:', emailError.message);
        // Don't throw error - approval was successful, email is just a notification
      }
    }

    res.json({ message: 'Caregiver approved and notified via email ✅', caregiver: caregiverUser });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Reject caregiver and send email
router.put('/reject-caregiver/:id', auth, async (req, res) => {
  try {
    // Check admin authorization
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

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
      try {
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
      } catch (emailError) {
        console.error('Email notification failed, but rejection was successful:', emailError.message);
        // Don't throw error - rejection was successful, email is just a notification
      }
    }

    res.json({ message: 'Caregiver rejected and notified via email ❌', caregiver });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Toggle caregiver verification status
router.put('/toggle-verification/:id', auth, async (req, res) => {
  try {
    // Check admin authorization
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const { isVerified } = req.body;
    
    // First get the current profile to check if it's complete
    const currentProfile = await Caregiver.findOne({ user: req.params.id });
    if (!currentProfile) {
      return res.status(404).json({ message: 'Caregiver profile not found' });
    }
    
    // Update the caregiver profile verification status and profileComplete
    const updatedProfile = await Caregiver.findOneAndUpdate(
      { user: req.params.id },
      { 
        isVerified: isVerified,
        profileComplete: isVerified ? true : currentProfile.profileComplete
      },
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

    // Send email notification (with error handling)
    if (updatedUser && updatedUser.email) {
      try {
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
      } catch (emailError) {
        console.error('Email notification failed, but verification was successful:', emailError.message);
        // Don't throw error - verification was successful, email is just a notification
      }
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
    const verifiedCaregivers = await Caregiver.countDocuments({ isVerified: true });
    const pendingCaregivers = await Caregiver.countDocuments({ isVerified: false });
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
      verifiedCaregivers,
      pendingCaregivers,
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
    const { page, limit, skip } = getPaginationParams(req);
    const careSeekers = await CareSeeker.find().populate('user', 'email').skip(skip).limit(limit);
    const total = await CareSeeker.countDocuments();
    res.json({
      data: careSeekers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
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
    const { page, limit, skip } = getPaginationParams(req);
    const users = await User.find().select('-password').skip(skip).limit(limit);
    const total = await User.countDocuments();
    res.json({
      data: users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/caregivers
// @desc    Get all caregivers with comprehensive user info and filtering
// @access  Private (admin)
router.get('/caregivers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const { verification, search } = req.query;
    let query = {};
    
    // Filter by verification status
    if (verification === 'verified') {
      query.isVerified = true;
    } else if (verification === 'pending') {
      query.isVerified = false;
    }
    
    const { page, limit, skip } = getPaginationParams(req);
    let caregivers, total;
    
    // Search functionality
    if (search) {
      caregivers = await Caregiver.find(query).populate({
        path: 'user',
        match: {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        },
        select: 'email username phone status createdAt'
      }).skip(skip).limit(limit);
      total = await Caregiver.countDocuments(query);
      caregivers = caregivers.filter(caregiver => caregiver.user);
    } else {
      caregivers = await Caregiver.find(query).populate('user', 'email username phone status createdAt').skip(skip).limit(limit);
      total = await Caregiver.countDocuments(query);
    }
    
    // Format the response
    const formattedCaregivers = caregivers.map(profile => {
      const user = profile.user;
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        fullName: profile.fullName,
        specializationCategory: profile.specializationCategory,
        experienceYears: profile.experienceYears,
        location: typeof profile.location === 'string' ? profile.location : profile.location?.address || '',
        hourlyRate: profile.hourlyRate,
        isVerified: profile.isVerified,
        profileComplete: profile.profileComplete,
        documents: profile.documents?.length || 0,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    });
    
    res.json({
      data: formattedCaregivers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
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
    
    const { page, limit, skip } = getPaginationParams(req);
    const bookings = await Booking.find(query)
      .populate({
        path: 'caregiver',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'careSeeker',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Booking.countDocuments(query);
    
    res.json({
      data: bookings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
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
    const { page, limit, skip } = getPaginationParams(req);
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Review.countDocuments();
    
    res.json({
      data: reviews,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
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
    const { page, limit, skip } = getPaginationParams(req);
    const items = await Item.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Item.countDocuments();
    
    res.json({
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
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
    const { page, limit, skip } = getPaginationParams(req);
    const careNeeds = await CareNeed.find()
      .populate('careSeeker', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await CareNeed.countDocuments();
    
    res.json({
      data: careNeeds,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
