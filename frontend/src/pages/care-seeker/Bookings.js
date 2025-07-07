import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

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

export default function Bookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetails, setOpenDetails] = useState({});

  useEffect(() => {
    // Show success message if coming from booking form
    if (location.state?.message) {
      toast.success(location.state.message);
    }

    fetchBookings();
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/care-seekers/bookings', {
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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, 
        { status: 'cancelled' },
        { headers: { 'x-auth-token': token } }
      );

      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  const handleMarkAsComplete = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'completed' },
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Booking marked as completed!');
      fetchBookings();
    } catch (error) {
      console.error('Error marking booking as complete:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as complete.');
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

  // Helper to get the best available caregiver name
  const getCaregiverName = (booking) => {
    return (
      booking.caregiver?.user?.name ||
      booking.caregiver?.fullName ||
      booking.caregiver?.user?.username ||
      'Unknown Caregiver'
    );
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
              My Bookings
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage your care service bookings.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/care-seeker/search"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              Find Caregivers
            </Link>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any bookings yet. Start by finding a caregiver that matches your needs.
              </p>
              <Link
                to="/care-seeker/search"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Find Caregivers
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const startDateTime = formatDateTime(booking.startTime);
              const endDateTime = formatDateTime(booking.endTime);
              const duration = calculateDuration(booking.startTime, booking.endTime);
              const caregiver = booking.caregiver;
              const user = caregiver?.user || {};
              const isOpen = openDetails[booking._id];
              return (
                <div key={booking._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                  {/* Booking Details */}
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700">
                          {getCaregiverName(booking)[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-extrabold text-gray-900">
                            {getCaregiverName(booking)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Service:</span> {booking.service}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Date:</span> {startDateTime.date}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Time:</span> {startDateTime.time} - {endDateTime.time}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Duration:</span> {duration}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Price:</span> <span className="text-primary-700 font-bold">Ksh {booking.price}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Status:</span> <span className={classNames(statusStyles[booking.status], 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ml-1')}>{statusLabels[booking.status]}</span>
                    </div>
                    {/* Always visible action buttons below status */}
                    <div className="flex flex-col space-y-2 mb-2">
                      {booking.status === 'accepted' && new Date(booking.endTime) < new Date() && (
                        <button
                          onClick={() => handleMarkAsComplete(booking._id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Mark as Complete
                        </button>
                      )}
                      {(booking.status === 'completed' || (booking.status === 'accepted' && new Date(booking.endTime) < new Date())) && (
                        <Link
                          to={`/care-seeker/feedback/${booking._id}`}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Leave Review
                        </Link>
                      )}
                    </div>
                  </div>
                  {/* Toggle Caregiver Details */}
                  <button
                    className="mt-4 text-primary-700 font-semibold underline focus:outline-none"
                    onClick={() => setOpenDetails((prev) => ({ ...prev, [booking._id]: !isOpen }))}
                  >
                    {isOpen ? 'Hide Caregiver Details' : 'View Caregiver Details'}
                  </button>
                  {isOpen && (
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Email:</span> <span className="text-primary-700">{user.email || 'No email'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-gray-700">Phone:</span> <span className="text-primary-700">{user.phone || 'No phone'}</span>
                      </div>
                      {caregiver?.bio && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Bio:</span> {caregiver.bio}
                        </div>
                      )}
                      {caregiver?.experienceYears && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Experience:</span> {caregiver.experienceYears} years
                        </div>
                      )}
                      {caregiver?.qualifications && caregiver.qualifications.length > 0 && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Qualifications:</span> {caregiver.qualifications.join(', ')}
                        </div>
                      )}
                      {/* Add more caregiver details as needed */}
                    </div>
                  )}
                  {/* Actions */}
                  <div className="mt-4 flex flex-col space-y-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 