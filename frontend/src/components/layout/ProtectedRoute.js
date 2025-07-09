// src/components/layout/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Only show loading if a token exists (i.e., user is supposed to be authenticated)
  if (token && loading) {
    return <div className="text-center mt-10 text-gray-500">Checking permissions...</div>;
  }

  console.log('🔐 Checking ProtectedRoute:');
  console.log(' - User:', user);
  console.log(' - Role:', userRole);
  console.log(' - Authenticated:', isAuthenticated);
  console.log(' - Allowed roles:', allowedRoles);
  console.log(' - Current pathname:', location.pathname);

  if (!token || !isAuthenticated || !user || !allowedRoles.includes(userRole)) {
    console.warn('⛔ Not authorized — redirecting to login.');
    console.log('🔍 Auth check details:', {
      hasToken: !!token,
      isAuthenticated,
      hasUser: !!user,
      userRole,
      allowedRoles,
      userRoleIncluded: allowedRoles.includes(userRole)
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect caregivers with incomplete profile (only if not verified)
  if (userRole === 'caregiver' && user && user.profileComplete === false && !user.isVerified && location.pathname !== '/caregiver/complete-profile') {
    console.log('🔄 Redirecting unverified caregiver to complete profile');
    return <Navigate to="/caregiver/complete-profile" replace />;
  }

  return children;
}
