import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/layout/AdminLayout';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery();
  const statusFilter = query.get('status');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:5000/api/admin/bookings';
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }
        const res = await axios.get(url, {
          headers: { 'x-auth-token': token }
        });
        setBookings(res.data);
      } catch (err) {
        setError('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [statusFilter]);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">All Bookings {statusFilter && `(Status: ${statusFilter})`}</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Caregiver</th>
                <th className="px-4 py-2 border">Care Seeker</th>
                <th className="px-4 py-2 border">Service</th>
                <th className="px-4 py-2 border">Start Time</th>
                <th className="px-4 py-2 border">End Time</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Budget (Ksh)</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-2 border">{b.caregiverName || b.caregiver?.fullName || '-'}</td>
                  <td className="px-4 py-2 border">{b.careSeekerName || b.careSeeker?.fullName || '-'}</td>
                  <td className="px-4 py-2 border">{b.service}</td>
                  <td className="px-4 py-2 border">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{new Date(b.endTime).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{b.status}</td>
                  <td className="px-4 py-2 border">{b.budget}</td>
                  <td className="px-4 py-2 border">
                    {/* You can add a View Details button here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
} 