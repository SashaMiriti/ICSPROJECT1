import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Navbar from './components/layout/Navbar';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CaregiverConfirmation from './pages/auth/CaregiverConfirmation';
import CaregiverProfileCompletionForm from './pages/caregiver/CaregiverProfileCompletionForm';

// Public Pages
import LandingPage from './pages/LandingPage';

// Care Seeker Pages
import CareSeekerDashboard from './pages/care-seeker/Dashboard';
import CareSeekerProfilePage from './pages/care-seeker/CareSeekerProfilePage';
import SearchCaregivers from './pages/care-seeker/SearchCaregivers';
import CaregiverProfile from './pages/care-seeker/CaregiverProfile';
import BookingForm from './pages/care-seeker/BookingForm';
import CareSeekerBookings from './pages/care-seeker/Bookings';
import NeedsForm from './pages/care-seeker/NeedsForm';
import BookingDetails from './pages/care-seeker/BookingDetails';
import Feedback from './pages/care-seeker/Feedback';

// Caregiver Pages
import CaregiverDashboard from './pages/caregiver/Dashboard';
import CaregiverProfileEdit from './pages/caregiver/ProfileEdit';
import CaregiverOwnProfile from './pages/caregiver/CaregiverProfile';
import CaregiverSchedule from './pages/caregiver/Schedule';
import CaregiverBookings from './pages/caregiver/Bookings';
import CaregiverReviews from './pages/caregiver/Reviews';
import UploadDocuments from './pages/caregiver/UploadDocuments';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCaregivers from './pages/admin/AdminCaregivers';
import AdminCareSeekers from './pages/admin/AdminCareSeekers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminItems from './pages/admin/AdminItems';
import AdminCareNeeds from './pages/admin/AdminCareNeeds';
import PendingCaregivers from './components/PendingCaregiver';
import CaregiverDetail from './pages/admin/CaregiverDetail';
import CareSeekerDetail from './pages/admin/CareSeekerDetail';
import AdminBookings from './pages/admin/AdminBookings';

// Protected Route Wrapper
import ProtectedRoute from './components/layout/ProtectedRoute';

// 404 Page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-3xl font-bold text-gray-700">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <Routes>
          {/* Admin Protected Routes - render outside Layout so only AdminLayout is used */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/caregivers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCaregivers /></ProtectedRoute>} />
          <Route path="/admin/care-seekers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCareSeekers /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/items" element={<ProtectedRoute allowedRoles={['admin']}><AdminItems /></ProtectedRoute>} />
          <Route path="/admin/care-needs" element={<ProtectedRoute allowedRoles={['admin']}><AdminCareNeeds /></ProtectedRoute>} />
          <Route path="/admin/pending-caregivers" element={<ProtectedRoute allowedRoles={['admin']}><PendingCaregivers /></ProtectedRoute>} />
          <Route path="/admin/caregiver/:id" element={<ProtectedRoute allowedRoles={['admin']}><CaregiverDetail /></ProtectedRoute>} />
          <Route path="/admin/care-seeker/:id" element={<ProtectedRoute allowedRoles={['admin']}><CareSeekerDetail /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />

          {/* All other routes use Layout (with global Navbar) */}
          <Route path="/*" element={<Layout />}> 
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:resettoken" element={<ResetPassword />} />

            {/* Caregiver Routes (now inside Layout) */}
            <Route path="caregiver-confirmation" element={<CaregiverConfirmation />} />
            <Route path="caregiver/complete-profile" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverProfileCompletionForm /></ProtectedRoute>} />
            <Route path="caregiver/dashboard" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
            <Route path="caregiver/profile" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverOwnProfile /></ProtectedRoute>} />
            <Route path="caregiver/profile/edit" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverProfileEdit /></ProtectedRoute>} />
            <Route path="caregiver/schedule" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverSchedule /></ProtectedRoute>} />
            <Route path="caregiver/bookings" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverBookings /></ProtectedRoute>} />
            <Route path="caregiver/reviews" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverReviews /></ProtectedRoute>} />
            <Route path="caregiver/upload-docs" element={<ProtectedRoute allowedRoles={['caregiver']}><UploadDocuments /></ProtectedRoute>} />

            {/* Care Seeker Protected Routes */}
            <Route path="care-seeker/dashboard" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerDashboard /></ProtectedRoute>} />
            <Route path="care-seeker/profile" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerProfilePage /></ProtectedRoute>} />
            <Route path="care-seeker/search" element={<ProtectedRoute allowedRoles={['careSeeker']}><SearchCaregivers /></ProtectedRoute>} />
            <Route path="care-seeker/caregiver/:id" element={<ProtectedRoute allowedRoles={['careSeeker']}><CaregiverProfile /></ProtectedRoute>} />
            <Route path="care-seeker/booking/:id" element={<ProtectedRoute allowedRoles={['careSeeker']}><BookingForm /></ProtectedRoute>} />
            <Route path="care-seeker/bookings" element={<ProtectedRoute allowedRoles={['careSeeker']}><CareSeekerBookings /></ProtectedRoute>} />
            <Route path="care-seeker/needs" element={<ProtectedRoute allowedRoles={['careSeeker']}><NeedsForm /></ProtectedRoute>} />
            <Route path="care-seeker/booking-details/:id" element={<ProtectedRoute allowedRoles={['careSeeker']}><BookingDetails /></ProtectedRoute>} />
            <Route path="care-seeker/feedback" element={<ProtectedRoute allowedRoles={['careSeeker']}><Feedback /></ProtectedRoute>} />
            <Route path="care-seeker/feedback/:bookingId" element={<ProtectedRoute allowedRoles={['careSeeker']}><Feedback /></ProtectedRoute>} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
