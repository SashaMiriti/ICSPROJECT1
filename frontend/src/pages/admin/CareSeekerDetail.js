import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

export default function CareSeekerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [careSeeker, setCareSeeker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCareSeekerDetails();
  }, [fetchCareSeekerDetails]);

  const fetchCareSeekerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access admin dashboard');
        navigate('/login');
        return;
      }

      // Fetch care seeker details
      const careSeekerResponse = await axios.get(`http://localhost:5000/api/admin/care-seekers/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setCareSeeker(careSeekerResponse.data);

      // Fetch care seeker's bookings
      const bookingsResponse = await axios.get(`http://localhost:5000/api/admin/care-seekers/${id}/bookings`, {
        headers: { 'x-auth-token': token }
      });
      setBookings(bookingsResponse.data);

    } catch (error) {
      console.error('Error fetching care seeker details:', error);
      if (error.response?.status === 404) {
        setError('Care seeker not found');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load care seeker details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCareSeeker = async () => {
    if (!window.confirm(`Are you sure you want to delete ${careSeeker?.fullName}? This action cannot be undone and will also delete all associated bookings.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/care-seekers/${id}`, {
        headers: { 'x-auth-token': token }
      });

      toast.success('Care seeker deleted successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting care seeker:', error);
      toast.error('Failed to delete care seeker');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !careSeeker) {
    return (
      <AdminLayout>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Care seeker not found'}</p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Care Seeker Profile</h1>
            <p className="text-gray-600 mt-1">Detailed information about {careSeeker.fullName}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleDeleteCareSeeker}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete Care Seeker
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{careSeeker.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{careSeeker.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="mt-1 text-sm text-gray-900">{careSeeker.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(careSeeker.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">{careSeeker.location?.address || 'N/A'}</p>
              </div>
              {careSeeker.location?.coordinates && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {careSeeker.location.coordinates[1]}, {careSeeker.location.coordinates[0]}
                  </p>
                </div>
              )}
            </div>

            {/* Care Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Preferences</h2>
              <div className="space-y-4">
                {careSeeker.careType && careSeeker.careType.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Care Types</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {careSeeker.careType.map((type, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {careSeeker.medicalConditions && careSeeker.medicalConditions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {careSeeker.medicalConditions.map((condition, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {careSeeker.requiredTasks && careSeeker.requiredTasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Required Tasks</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {careSeeker.requiredTasks.map((task, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {careSeeker.caregiverGenderPreference && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
                    <p className="mt-1 text-sm text-gray-900">{careSeeker.caregiverGenderPreference}</p>
                  </div>
                )}

                {careSeeker.languagePreferences && careSeeker.languagePreferences.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language Preferences</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {careSeeker.languagePreferences.map((lang, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {careSeeker.budget && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget</label>
                    <p className="mt-1 text-sm text-gray-900">Ksh {careSeeker.budget}</p>
                  </div>
                )}

                {careSeeker.specialNeeds && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Special Needs</label>
                    <p className="mt-1 text-sm text-gray-900">{careSeeker.specialNeeds}</p>
                  </div>
                )}

                {careSeeker.culturalConsiderations && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cultural Considerations</label>
                    <p className="mt-1 text-sm text-gray-900">{careSeeker.culturalConsiderations}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-sm font-medium text-gray-900">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {bookings.filter(b => b.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cancelled</span>
                  <span className="text-sm font-medium text-red-600">
                    {bookings.filter(b => b.status === 'cancelled').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Schedule */}
            {careSeeker.schedule && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Schedule</h3>
                {careSeeker.schedule.days && careSeeker.schedule.days.length > 0 ? (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Days</label>
                      <p className="mt-1 text-sm text-gray-900">{careSeeker.schedule.days.join(', ')}</p>
                    </div>
                    {careSeeker.schedule.timeSlots && careSeeker.schedule.timeSlots.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Slots</label>
                        <div className="mt-1 space-y-1">
                          {careSeeker.schedule.timeSlots.map((slot, index) => (
                            <p key={index} className="text-sm text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No schedule preferences set</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bookings History */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Booking History</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caregiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                            {booking.caregiver?.user?.name?.[0] || 'C'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.caregiver?.user?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Ksh {booking.price || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 