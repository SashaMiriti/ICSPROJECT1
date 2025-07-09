import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminProfile() {
  const { user } = useAuth();
  const [pendingCaregivers, setPendingCaregivers] = useState([]);
  const [activeSection, setActiveSection] = useState(null); // Controls which section is visible

  useEffect(() => {
    const fetchPendingCaregivers = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/admin/pending-caregivers', {
          headers: { 'x-auth-token': token }
        });
        setPendingCaregivers(response.data);
      } catch (error) {
        console.error('Failed to fetch pending caregivers:', error);
      }
    };

    fetchPendingCaregivers();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        decision === 'approved'
          ? `http://localhost:5000/api/admin/approve-caregiver/${id}`
          : `http://localhost:5000/api/admin/reject-caregiver/${id}`;

      await axios.put(endpoint, {}, {
        headers: { 'x-auth-token': token }
      });
      setPendingCaregivers(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error updating caregiver status:', err);
    }
  };

  const cards = [
    {
      title: 'Pending Caregivers',
      description: 'Approve or reject caregiver applications.',
      action: () => setActiveSection('pending'),
    },
    {
      title: 'Bookings Overview',
      description: 'Manage caregiver bookings submitted by care seekers.',
      action: () => alert('Coming soon...'),
    },
    {
      title: 'Profile',
      description: 'Edit your admin profile and account settings.',
      action: () => alert('Coming soon...'),
    },
    {
      title: 'System Logs',
      description: 'Review platform actions and logs.',
      action: () => alert('Coming soon...'),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">TogetherCare Admin</h1>
      <p className="mb-6 text-gray-600">Welcome, {user?.username || 'Admin'}</p>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className="cursor-pointer p-6 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Pending Caregivers Section */}
      {activeSection === 'pending' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Caregiver Applications</h2>
          {pendingCaregivers.length === 0 ? (
            <p className="text-gray-500">No pending caregivers found.</p>
          ) : (
            <ul className="space-y-4">
              {pendingCaregivers.map(caregiver => (
                <li key={caregiver._id} className="bg-gray-50 p-4 rounded shadow">
                  <p><strong>Name:</strong> {caregiver.fullName}</p>
                  <p><strong>Email:</strong> {caregiver.email}</p>
                  <p><strong>Phone:</strong> {caregiver.phone}</p>

                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleDecision(caregiver._id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(caregiver._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
