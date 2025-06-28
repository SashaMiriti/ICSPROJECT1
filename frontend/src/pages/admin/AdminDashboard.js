import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome, {user?.username || ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate('/admin/pending-caregivers')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Pending Caregivers</h3>
          <p className="text-gray-600 text-sm">Approve or reject caregiver applications.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Bookings Overview</h3>
          <p className="text-gray-600 text-sm">Manage caregiver bookings submitted by care seekers.</p>
        </div>

        <div
          onClick={() => navigate('/admin/profile')}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Profile</h3>
          <p className="text-gray-600 text-sm">Edit your admin profile and account settings.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">System Logs</h3>
          <p className="text-gray-600 text-sm">Review platform actions and logs.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
