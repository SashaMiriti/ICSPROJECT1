import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${
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
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your reviews');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/caregivers/reviews', {
        headers: { 'x-auth-token': token }
      });

      setReviews(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your reviews...</p>
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
              onClick={fetchReviews}
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Customer Reviews</h1>
            <div className="mt-2 flex items-center">
              <StarRating rating={Math.round(averageRating)} />
              <p className="ml-2 text-sm text-gray-700">
                {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
              </p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't received any reviews yet. Complete some bookings to start receiving feedback from care seekers.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <div className="divide-y divide-gray-300">
                    {reviews.map((review) => {
                      const bookingDateTime = formatDateTime(review.booking.startTime);
                      
                      return (
                        <div key={review._id} className="bg-white px-4 py-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-bold text-primary-700">
                                {review.careSeeker?.user?.name?.[0] || 'C'}
                              </div>
                              <div className="ml-4">
                                <h3 className="text-md font-semibold text-gray-900">
                                  {review.careSeeker?.user?.name || 'Anonymous'}
                                </h3>
                                <p className="text-sm text-gray-500">{review.booking.service}</p>
                                <p className="text-xs text-gray-400">
                                  {bookingDateTime.date} • {bookingDateTime.time}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 text-right">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="mt-2">
                            <StarRating rating={review.rating} />
                          </div>
                          <div className="mt-4 text-sm text-gray-600">
                            <p className="leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}