// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Public Pages
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CaregiverConfirmation from './pages/auth/CaregiverConfirmation';

// Care Seeker Pages
import CareSeekerDashboard from './pages/care-seeker/Dashboard';
import CareSeekerProfilePage from './pages/CareSeekerProfilePage';
import SearchCaregivers from './pages/care-seeker/SearchCaregivers';
import CaregiverProfile from './pages/care-seeker/CaregiverProfile';
import BookingForm from './pages/care-seeker/BookingForm';
import CareSeekerBookings from './pages/care-seeker/Bookings';

// Caregiver Pages
import CaregiverDashboard from './pages/caregiver/Dashboard';
import CaregiverProfileEdit from './pages/caregiver/ProfileEdit';
import CaregiverSchedule from './pages/caregiver/Schedule';
import CaregiverBookings from './pages/caregiver/Bookings';
import CaregiverReviews from './pages/caregiver/Reviews';
import UploadDocuments from './pages/caregiver/UploadDocuments';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import PendingCaregivers from './components/PendingCaregiver'; 
import CaregiverDetail from './pages/admin/CaregiverDetail';


// Protected Route Wrapper
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/caregiver-confirmation" element={<CaregiverConfirmation />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:resettoken" element={<ResetPassword />} />

            {/* Care Seeker Protected Routes */}
            <Route path="care-seeker/dashboard" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerDashboard /></ProtectedRoute>} />
            <Route path="care-seeker/profile" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerProfilePage /></ProtectedRoute>} />
            <Route path="care-seeker/search" element={<ProtectedRoute allowedRoles={['careSeeker']}><SearchCaregivers /></ProtectedRoute>} />
            <Route path="care-seeker/caregiver/:id" element={<ProtectedRoute allowedRoles={['careSeeker']}><CaregiverProfile /></ProtectedRoute>} />
            <Route path="care-seeker/booking/:id" element={<ProtectedRoute allowedRoles={['careSeeker']}><BookingForm /></ProtectedRoute>} />
            <Route path="care-seeker/bookings" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerBookings /></ProtectedRoute>} />

            {/* Caregiver Protected Routes */}
            <Route path="caregiver/dashboard" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
            <Route path="caregiver/profile" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverProfileEdit /></ProtectedRoute>} />
            <Route path="caregiver/schedule" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverSchedule /></ProtectedRoute>} />
            <Route path="caregiver/bookings" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverBookings /></ProtectedRoute>} />
            <Route path="caregiver/reviews" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverReviews /></ProtectedRoute>} />
            <Route path="caregiver/upload-docs" element={<ProtectedRoute allowedRoles={['caregiver']}><UploadDocuments /></ProtectedRoute>} />

            {/* ✅ Admin Protected Routes */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
            <Route path="admin/pending-caregivers" element={<ProtectedRoute allowedRoles={['admin']}><PendingCaregivers /></ProtectedRoute>} />
            <Route path="/admin/caregiver/:id" element={<CaregiverDetail />} />

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
