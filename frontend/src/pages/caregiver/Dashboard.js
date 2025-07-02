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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/caregivers/profile`, {
          headers: {
            'x-auth-token': token,
          },
        });
        console.log('Caregiver profile data:', res.data);
        setCaregiverProfile(res.data);
      } catch (err) {
        console.error('❌ Error fetching caregiver profile:', err);
      }
    };
    if (user?.role === 'caregiver') {
      fetchProfile();
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

  const fullName = caregiverProfile?.fullName || 'Caregiver';
  const initial = fullName?.charAt(0)?.toUpperCase() || 'C';

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50 relative">
      <div className="flex justify-end p-4 relative" ref={dropdownRef}>
        <button
          className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold shadow focus:outline-none"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {initial}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-12 w-40 bg-white rounded-lg shadow-lg z-20">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-green-100 text-gray-700"
              onClick={() => {
                setModalOpen(true);
                setDropdownOpen(false);
              }}
            >
              Profile
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-green-100 text-gray-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Profile Details</h2>
            {caregiverProfile ? (
              <div className="space-y-2">
                <div><span className="font-semibold">Full Name:</span> {caregiverProfile.fullName}</div>
                <div><span className="font-semibold">Email:</span> {caregiverProfile.user?.email}</div>
                {caregiverProfile.contactNumber && <div><span className="font-semibold">Contact Number:</span> {caregiverProfile.contactNumber}</div>}
                {caregiverProfile.bio && <div><span className="font-semibold">Bio:</span> {caregiverProfile.bio}</div>}
                {caregiverProfile.experienceYears !== undefined && <div><span className="font-semibold">Experience (years):</span> {caregiverProfile.experienceYears}</div>}
                {caregiverProfile.specializations && caregiverProfile.specializations.length > 0 && (
                  <div><span className="font-semibold">Specializations:</span> {caregiverProfile.specializations.join(', ')}</div>
                )}
                {caregiverProfile.servicesOffered && caregiverProfile.servicesOffered.length > 0 && (
                  <div><span className="font-semibold">Services Offered:</span> {caregiverProfile.servicesOffered.join(', ')}</div>
                )}
                {caregiverProfile.languagesSpoken && caregiverProfile.languagesSpoken.length > 0 && (
                  <div><span className="font-semibold">Languages Spoken:</span> {caregiverProfile.languagesSpoken.join(', ')}</div>
                )}
                {caregiverProfile.gender && <div><span className="font-semibold">Gender:</span> {caregiverProfile.gender}</div>}
                {caregiverProfile.specializationCategory && <div><span className="font-semibold">Specialization Category:</span> {caregiverProfile.specializationCategory}</div>}
                {caregiverProfile.culture && <div><span className="font-semibold">Culture:</span> {caregiverProfile.culture}</div>}
                {caregiverProfile.religion && <div><span className="font-semibold">Religion:</span> {caregiverProfile.religion}</div>}
                {caregiverProfile.availability && caregiverProfile.availability.days && caregiverProfile.availability.days.length > 0 && (
                  <div><span className="font-semibold">Schedule:</span> {caregiverProfile.availability.days.join(', ')}</div>
                )}
                {caregiverProfile.location && caregiverProfile.location.address && (
                  <div><span className="font-semibold">Location:</span> {caregiverProfile.location.address}</div>
                )}
                <div><span className="font-semibold">Verified:</span> {caregiverProfile.isVerified ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-green-700 mb-2">Caregiver Dashboard</h1>
        <p className="text-lg text-gray-700 mb-6">Welcome {fullName}</p>

        <div className="flex flex-col gap-6 w-full max-w-xs">
          <button
            onClick={() => navigate('/caregiver/bookings')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-xl shadow text-lg font-medium"
          >
            My Bookings
          </button>
          <button
            onClick={() => navigate('/caregiver/schedule')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-5 rounded-xl shadow text-lg font-medium"
          >
            My Schedule
          </button>
          <button
            onClick={() => navigate('/caregiver/reviews')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-5 rounded-xl shadow text-lg font-medium"
          >
            My Reviews
          </button>
        </div>
      </div>
    </div>
  );
}
