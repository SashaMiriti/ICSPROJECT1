// src/components/layout/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Checking permissions...</div>;
  }

  console.log('🔐 Checking ProtectedRoute:');
  console.log(' - User:', user);
  console.log(' - Role:', userRole);
  console.log(' - Authenticated:', isAuthenticated);
  console.log(' - Allowed roles:', allowedRoles);

  if (!isAuthenticated || !user || !allowedRoles.includes(userRole)) {
    console.warn('⛔ Not authorized — redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect caregivers with incomplete profile
  if (userRole === 'caregiver' && user && user.profileComplete === false && location.pathname !== '/caregiver/complete-profile') {
    return <Navigate to="/caregiver/complete-profile" replace />;
  }

  return children;
}
