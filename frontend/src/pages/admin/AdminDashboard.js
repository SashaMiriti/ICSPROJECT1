import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCareSeekers: 0,
    totalCaregivers: 0,
    verifiedCaregivers: 0,
    pendingCaregivers: 0,
    approvedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalReviews: 0
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access admin dashboard');
        navigate('/login');
        return;
      }

      // Fetch statistics
      const statsResponse = await axios.get('http://localhost:5000/api/admin/statistics', {
        headers: { 'x-auth-token': token }
      });
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {user?.username || ''}
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-blue-50 transition" onClick={() => navigate('/admin/users')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-green-50 transition" onClick={() => navigate('/admin/caregivers')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Caregivers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCaregivers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-yellow-50 transition" onClick={() => navigate('/admin/pending-caregivers')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Caregivers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingCaregivers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-purple-50 transition" onClick={() => navigate('/admin/care-seekers')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Care Seekers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCareSeekers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-indigo-50 transition" onClick={() => navigate('/admin/bookings')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-yellow-50 transition" onClick={() => navigate('/admin/bookings?status=pending')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-green-50 transition" onClick={() => navigate('/admin/bookings?status=accepted')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-red-50 transition" onClick={() => navigate('/admin/bookings?status=cancelled')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelledBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-pink-50 transition" onClick={() => navigate('/admin/reviews')}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => navigate('/admin/pending-caregivers')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Pending Caregivers</h3>
          <p className="text-gray-600 text-sm">Approve or reject caregiver applications.</p>
        </div>

        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
          <p className="text-gray-600 text-sm">View and manage all user accounts.</p>
        </div>

        <div
          onClick={() => navigate('/admin/caregivers')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Manage Caregivers</h3>
          <p className="text-gray-600 text-sm">View and manage caregiver profiles.</p>
        </div>

        <div
          onClick={() => navigate('/admin/care-seekers')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Manage Care Seekers</h3>
          <p className="text-gray-600 text-sm">View and manage care seeker profiles.</p>
        </div>

        <div
          onClick={() => navigate('/admin/bookings')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
          <p className="text-gray-600 text-sm">View and manage all bookings.</p>
        </div>

        <div
          onClick={() => navigate('/admin/reviews')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Manage Reviews</h3>
          <p className="text-gray-600 text-sm">View and manage all reviews.</p>
        </div>

        <div
          onClick={() => navigate('/admin/profile')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Profile</h3>
          <p className="text-gray-600 text-sm">Edit your admin profile and account settings.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
