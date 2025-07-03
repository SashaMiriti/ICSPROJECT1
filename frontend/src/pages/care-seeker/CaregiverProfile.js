import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCaregiverProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch caregiver details
      const caregiverResponse = await axios.get(`http://localhost:5000/api/caregivers/${id}`);
      setCaregiver(caregiverResponse.data.caregiver);
      setReviews(caregiverResponse.data.reviews || []);

    } catch (err) {
      console.error('Error fetching caregiver profile:', err);
      if (err.response?.status === 404) {
        setError('Caregiver not found');
      } else {
        setError('Failed to fetch caregiver profile');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCaregiverProfile();
  }, [fetchCaregiverProfile]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading caregiver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !caregiver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Caregiver not found'}</p>
          <button
            onClick={() => navigate('/care-seeker/search')}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-primary-700">
                {(caregiver.fullName && caregiver.fullName[0]) || caregiver.user?.name?.[0] || 'C'}
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-white">
                  {caregiver.fullName || caregiver.user?.name || 'Caregiver'}
                </h1>
                <p className="text-primary-100 mt-1">
                  {caregiver.experienceYears || 0} years of experience
                </p>
                <div className="flex items-center mt-2">
                  <StarRating rating={Math.round(averageRating)} />
                  <span className="ml-2 text-white">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">
                {caregiver.bio || 'No bio available'}
              </p>
            </div>

            {/* Services & Specializations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Services & Specializations</h2>
              <div className="space-y-4">
                {caregiver.servicesOffered && caregiver.servicesOffered.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.servicesOffered.map((service, index) => (
                        <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {caregiver.specializations && caregiver.specializations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.specializations.map((spec, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {caregiver.qualifications && caregiver.qualifications.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Qualifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {caregiver.qualifications.map((qual, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                            {review.careSeeker?.user?.name?.[0] || 'A'}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">
                              {review.careSeeker?.user?.name || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-gray-500">{review.booking?.service}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mb-2">
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Booking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact & Booking</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Hourly Rate</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    Ksh {caregiver.hourlyRate || 'Not specified'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Contact</h3>
                  <p className="text-gray-600">{caregiver.user?.email || 'Email not available'}</p>
                  <p className="text-gray-600">{caregiver.user?.phone || 'Phone not available'}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{caregiver.location?.address || 'Location not specified'}</p>
                </div>

                <div className="pt-4">
                  <Link
                    to={`/care-seeker/booking/${caregiver._id}`}
                    className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-center block"
                  >
                    Book This Caregiver
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                {caregiver.languagesSpoken && caregiver.languagesSpoken.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Languages</h3>
                    <p className="text-gray-600">{caregiver.languagesSpoken.join(', ')}</p>
                  </div>
                )}

                {caregiver.gender && (
                  <div>
                    <h3 className="font-medium text-gray-900">Gender</h3>
                    <p className="text-gray-600">{caregiver.gender}</p>
                  </div>
                )}

                {caregiver.availability && caregiver.availability.days && caregiver.availability.days.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Available Days</h3>
                    <p className="text-gray-600">{caregiver.availability.days.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 