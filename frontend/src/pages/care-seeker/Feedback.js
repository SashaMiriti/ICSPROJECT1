import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function StarRating({ rating, onRatingChange, readonly = false }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          onClick={() => !readonly && onRatingChange(star)}
          className={`focus:outline-none ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={readonly}
        >
          <svg
            className={`h-8 w-8 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [caregiver, setCaregiver] = useState(null);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to leave a review');
        navigate('/login');
        return;
      }

      // Fetch booking details
      const bookingResponse = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { 'x-auth-token': token }
      });

      const bookingData = bookingResponse.data;
      
      // Verify booking belongs to current user and is completed
      if (bookingData.status !== 'completed') {
        toast.error('You can only review completed bookings');
        navigate('/care-seeker/bookings');
        return;
      }

      setBooking(bookingData);
      setCaregiver(bookingData.caregiver);

      // Check if review already exists
      try {
        const reviewResponse = await axios.get(`http://localhost:5000/api/care-seekers/reviews/${bookingId}`, {
          headers: { 'x-auth-token': token }
        });
        
        if (reviewResponse.data) {
          toast.error('You have already reviewed this booking');
          navigate('/care-seeker/bookings');
          return;
        }
      } catch (error) {
        // Review doesn't exist, which is what we want
      }

    } catch (error) {
      console.error('Error fetching booking details:', error);
      if (error.response?.status === 404) {
        toast.error('Booking not found');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to review this booking');
      } else {
        toast.error('Failed to load booking details');
      }
      navigate('/care-seeker/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const reviewData = {
        booking: bookingId,
        rating: formData.rating,
        comment: formData.comment.trim()
      };

      await axios.post('http://localhost:5000/api/care-seekers/reviews', reviewData, {
        headers: { 'x-auth-token': token }
      });

      toast.success('Review submitted successfully!');
      navigate('/care-seeker/bookings', { 
        state: { 
          message: 'Your review has been submitted and will be visible on the caregiver\'s profile.' 
        } 
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid review data');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to submit this review');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking || !caregiver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Booking not found or unauthorized</p>
          <button
            onClick={() => navigate('/care-seeker/bookings')}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const startDateTime = formatDateTime(booking.startTime);
  const endDateTime = formatDateTime(booking.endTime);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Leave a Review</h1>
            <p className="text-primary-100 mt-1">Share your experience with this caregiver</p>
          </div>

          {/* Caregiver Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700">
                {caregiver.user?.name?.[0] || 'C'}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {caregiver.user?.name || 'Caregiver'}
                </h2>
                <p className="text-gray-600">{booking.service}</p>
                <p className="text-sm text-gray-500">
                  {startDateTime.date} • {startDateTime.time} - {endDateTime.time}
                </p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                How would you rate your experience? *
              </label>
              <StarRating 
                rating={formData.rating} 
                onRatingChange={handleRatingChange}
              />
              <div className="mt-2 text-sm text-gray-600">
                {formData.rating === 5 && 'Excellent - Outstanding service'}
                {formData.rating === 4 && 'Very Good - Great experience'}
                {formData.rating === 3 && 'Good - Satisfactory service'}
                {formData.rating === 2 && 'Fair - Room for improvement'}
                {formData.rating === 1 && 'Poor - Unsatisfactory experience'}
                {formData.rating === 0 && 'Click on a star to rate'}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-lg font-medium text-gray-900 mb-3">
                Share your experience *
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={5}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Tell us about your experience with this caregiver. What went well? What could be improved? Your feedback helps other families make informed decisions."
                value={formData.comment}
                onChange={handleCommentChange}
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                {formData.comment.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/care-seeker/bookings')}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.rating === 0 || !formData.comment.trim()}
                className="flex-1 bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 