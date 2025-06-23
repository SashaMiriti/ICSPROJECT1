import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Corrected path to AuthContext
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';

// NEW: Use the comprehensive profile page we've been building
import CareSeekerProfilePage from './pages/CareSeekerProfilePage';

// Care Seeker Pages
import CareSeekerDashboard from './pages/care-seeker/Dashboard';
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

function App() {
  return (
    // The AuthProvider MUST wrap everything that uses the auth context.
    // This includes the Router, and all components rendered within the routes.
    <AuthProvider>
      <Router>
        {/* If Navbar is global and NOT part of Layout, place it here: */}
        {/* <Navbar /> */}

        <Routes>
          {/*
            The <Route path="/" element={<Layout />}> acts as a parent route.
            All nested routes inherit from this path and will render within the <Outlet>
            component inside your <Layout> component. This is a good pattern.
          */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes (nested under Layout) */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} /> {/* Register must be here */}

            {/* Care Seeker Routes (nested under Layout and protected by PrivateRoute) */}
            <Route
              path="care-seeker/dashboard"
              element={
                <PrivateRoute>
                  <CareSeekerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="care-seeker/profile"
              element={
                <PrivateRoute>
                  <CareSeekerProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="care-seeker/search"
              element={
                <PrivateRoute>
                  <SearchCaregivers />
                </PrivateRoute>
              }
            />
            <Route
              path="care-seeker/caregiver/:id"
              element={
                <PrivateRoute>
                  <CaregiverProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="care-seeker/booking/:id"
              element={
                <PrivateRoute>
                  <BookingForm />
                </PrivateRoute>
              }
            />
            <Route
              path="care-seeker/bookings"
              element={
                <PrivateRoute>
                  <CareSeekerBookings />
                </PrivateRoute>
              }
            />

            {/* Caregiver Routes (nested under Layout and protected by PrivateRoute) */}
            <Route
              path="caregiver/dashboard"
              element={
                <PrivateRoute>
                  <CaregiverDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="caregiver/profile"
              element={
                <PrivateRoute>
                  <CaregiverProfileEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="caregiver/schedule"
              element={
                <PrivateRoute>
                  <CaregiverSchedule />
                </PrivateRoute>
              }
            />
            <Route
              path="caregiver/bookings"
              element={
                <PrivateRoute>
                  <CaregiverBookings />
                </PrivateRoute>
              }
            />
            <Route
              path="caregiver/reviews"
              element={
                <PrivateRoute>
                  <CaregiverReviews />
                </PrivateRoute>
              }
            />

            {/* Add any other nested routes here */}
          </Route> {/* End of the parent Route for Layout */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
