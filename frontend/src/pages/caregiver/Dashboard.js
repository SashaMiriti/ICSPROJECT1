<<<<<<< HEAD
// frontend/src/pages/caregiver/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CaregiverDashboard() {
  const { user, token } = useAuth();
  const [caregiverProfile, setCaregiverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('👤 Dashboard user:', user);
    console.log('🔐 Dashboard token:', token);

    const fetchCaregiverProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/caregivers/profile`, {
          headers: { 'x-auth-token': token }
        });
        console.log('📦 Caregiver profile fetched:', response.data);
        setCaregiverProfile(response.data);
      } catch (error) {
        console.error('❌ Failed to fetch caregiver profile:', error);
        setError('Could not load caregiver profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'caregiver' && token) {
      fetchCaregiverProfile();
    } else {
      setLoading(false);
      setError('Unauthorized access or missing login data.');
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Loading your caregiver dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4 flex flex-col items-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Welcome, {user?.username || caregiverProfile?.fullName || 'Caregiver'}!
        </h1>
        <p className="text-gray-600 mb-6">Your caregiver profile information is displayed below.</p>

        <div className="text-left space-y-4 text-gray-700">
          <p><strong>Full Name:</strong> {caregiverProfile?.fullName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Contact Number:</strong> {caregiverProfile?.contactNumber}</p>
          <p><strong>Bio:</strong> {caregiverProfile?.bio}</p>
          <p><strong>Location:</strong> {caregiverProfile?.location?.address}</p>

          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
  <Link
    to="/caregiver/bookings"
    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
  >
    View My Bookings
  </Link>
  <Link
    to="/caregiver/schedule"
    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
  >
    My Schedule
  </Link>
  <Link
    to="/caregiver/reviews"
    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
  >
    My Reviews
  </Link>
</div>
        </div>
      </div>
    </div>
  );
}
=======
     // frontend/src/pages/caregiver/Dashboard.js
     import React from 'react';
     import { Link } from 'react-router-dom';
 
     export default function CaregiverDashboard() {
       return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
           <div className="bg-white p-8 rounded-lg shadow-md text-center">
             <h1 className="text-3xl font-bold text-gray-800 mb-4">Caregiver Dashboard</h1>
             <p className="text-gray-600 mb-6">Welcome, Caregiver! Your account was successfully created.</p>
             <Link to="/login" className="text-blue-600 hover:underline">
               Go back to Login
             </Link>
             <p className="mt-4 text-sm text-gray-500">
               This is a placeholder page. You can build out your dashboard features here.
             </p>
           </div>
         </div>
       );
     }
     
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
