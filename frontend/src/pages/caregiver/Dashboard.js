import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CaregiverDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [caregiverProfile, setCaregiverProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userTimeout, setUserTimeout] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging
  console.log('🔍 CaregiverDashboard Debug:', { user, token, loading, error, userTimeout });
  console.log('🎯 Dashboard rendering with user:', user);

  // Add a timeout to avoid infinite loading if user is never set
  useEffect(() => {
    if (!user) {
      const timeout = setTimeout(() => setUserTimeout(true), 4000);
      return () => clearTimeout(timeout);
    } else {
      setUserTimeout(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered:', { user, token });
    const fetchProfile = async () => {
      try {
        console.log('📡 Fetching caregiver profile...');
        const res = await axios.get(`http://localhost:5000/api/caregivers/profile`, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('✅ Profile fetched:', res.data);
        setCaregiverProfile(res.data);
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setError('Could not load caregiver profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'caregiver') {
      fetchProfile();
    } else if (user && user.role !== 'caregiver') {
      console.log('🚫 User is not a caregiver:', user.role);
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user, token]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const fullName = caregiverProfile?.fullName || user?.username || user?.name || 'Caregiver';
  const initial = fullName?.charAt(0)?.toUpperCase() || 'C';

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  if (userTimeout && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center text-red-500">Unable to load user information. Please <button className="underline" onClick={() => navigate('/login')}>log in</button> again.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center text-gray-500">Loading your caregiver dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-xl w-full relative">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Caregiver Dashboard</h1>
        <p className="text-lg text-gray-700 mb-6">Welcome {fullName}</p>
        <div className="flex flex-col gap-6 mb-6">
          <button
            onClick={() => navigate('/caregiver/bookings')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 rounded shadow focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            My Bookings
          </button>
          <button
            onClick={() => navigate('/caregiver/schedule')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold py-4 rounded shadow focus:outline-none focus:ring-4 focus:ring-purple-400"
          >
            My Schedule
          </button>
          <button
            onClick={() => navigate('/caregiver/reviews')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xl font-bold py-4 rounded shadow focus:outline-none focus:ring-4 focus:ring-yellow-400"
          >
            My Reviews
          </button>
        </div>
      </div>
    </div>
  );
}
