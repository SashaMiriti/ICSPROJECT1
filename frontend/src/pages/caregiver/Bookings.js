import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  accepted: 'bg-green-50 text-green-700 ring-green-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  cancelled: 'bg-gray-50 text-gray-700 ring-gray-600/20',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/caregivers/bookings/upcoming', {
        headers: { 'x-auth-token': token }
      });

      setBookings(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const status = action === 'accept' ? 'accepted' : 'rejected';
      
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, 
        { status },
        { headers: { 'x-auth-token': token } }
      );

      toast.success(`Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
      fetchBookings(); // Refresh the list
    } catch (error) {
      // Show the backend error message if available
      const backendMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg;
      toast.error(backendMsg || `Failed to ${action} booking. Please try again.`);
      console.error(`Error ${action}ing booking:`, error.response?.data || error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Booking Requests
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and manage your care service bookings.
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't received any booking requests yet. Keep your profile updated to attract more clients.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  {bookings.map((booking) => {
                    const startDateTime = formatDateTime(booking.startTime);
                    const endDateTime = formatDateTime(booking.endTime);
                    const duration = calculateDuration(booking.startTime, booking.endTime);
                    
                    return (
                      <div key={booking._id} className="bg-white">
                        <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8">
                          <div className="sm:flex lg:col-span-7">
                            <div className="mt-6 sm:mt-0">
                              <h3 className="text-base font-medium text-gray-900">
                                {booking.careSeeker && booking.careSeeker.user
                                  ? (booking.careSeeker.user.fullName ||
                                     booking.careSeeker.user.name ||
                                     booking.careSeeker.user.username ||
                                     booking.careSeeker.fullName ||
                                     'Unknown Client')
                                  : 'Unknown Client'}
                              </h3>
                              <div className="mt-1 flex items-center">
                                <span
                                  className={classNames(
                                    statusStyles[booking.status],
                                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset'
                                  )}
                                >
                                  {statusLabels[booking.status]}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-900">
                                {booking.service}
                              </p>
                              <div className="mt-3 space-y-2 text-sm text-gray-500">
                                <p>Date: {startDateTime.date}</p>
                                <p>
                                  Time: {startDateTime.time} - {endDateTime.time}
                                </p>
                                <p>Duration: {duration}</p>
                                <p>Location: {booking.location?.address || 'Location not specified'}</p>
                                <p>Budget: Ksh {booking.budget !== undefined ? booking.budget : 'Not specified'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 lg:col-span-5 lg:mt-0">
                            <dl className="space-y-4 text-sm text-gray-600">
                              <div>
                                <dt className="font-medium text-gray-900">
                                  Contact Information
                                </dt>
                                <dd className="mt-2">
                                  <div className="space-y-1">
                                    <p>Email: {booking.careSeeker && booking.careSeeker.user ? booking.careSeeker.user.email : 'No email'}</p>
                                    <p>Phone: {booking.careSeeker && booking.careSeeker.user && booking.careSeeker.user.phone
                                      ? booking.careSeeker.user.phone
                                      : (booking.careSeeker && booking.careSeeker.contactNumber
                                          ? booking.careSeeker.contactNumber
                                          : 'No phone')}
                                    </p>
                                  </div>
                                </dd>
                              </div>
                              {booking.notes && (
                                <div>
                                  <dt className="font-medium text-gray-900">Notes</dt>
                                  <dd className="mt-2 whitespace-pre-wrap">
                                    {booking.notes}
                                  </dd>
                                </div>
                              )}
                            </dl>

                            {booking.status === 'pending' && (
                              <div className="mt-6 flex space-x-3">
                                <button
                                  type="button"
                                  onClick={() => handleBookingAction(booking._id, 'accept')}
                                  className="flex-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBookingAction(booking._id, 'reject')}
                                  className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            
                            {booking.status === 'accepted' && (
                              <div className="mt-6">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                  ✓ Booking Confirmed
                                </span>
                              </div>
                            )}
                            
                            {booking.status === 'rejected' && (
                              <div className="mt-6">
                                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                                  ✗ Booking Declined
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 