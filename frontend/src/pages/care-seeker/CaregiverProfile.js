import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function CaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCaregiverProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch caregiver profile using the robust endpoint
      const response = await axios.get(`/api/caregivers/${id}/profile`);
      setCaregiver(response.data);
    } catch (error) {
      console.error('Error fetching caregiver profile:', error);
      toast.error('Failed to load caregiver profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCaregiverProfile();
  }, [fetchCaregiverProfile]);

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

  if (!caregiver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Caregiver not found</p>
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
                  {/* Remove StarRating and reviews count */}
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
                  {caregiver.priceType && (
                    <p className="text-gray-700 mt-1">Price Type: <span className="font-semibold">{caregiver.priceType}</span></p>
                  )}
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
                <div>
                  <h3 className="font-medium text-gray-900">Verification Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    caregiver.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {caregiver.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
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
                {caregiver.specializationCategory && (
                  <div>
                    <h3 className="font-medium text-gray-900">Specialization Category</h3>
                    <p className="text-gray-600">{caregiver.specializationCategory}</p>
                  </div>
                )}
                {caregiver.tribalLanguage && (
                  <div>
                    <h3 className="font-medium text-gray-900">Tribal Language</h3>
                    <p className="text-gray-600">{caregiver.tribalLanguage}</p>
                  </div>
                )}
                {caregiver.culture && (
                  <div>
                    <h3 className="font-medium text-gray-900">Culture</h3>
                    <p className="text-gray-600">{caregiver.culture}</p>
                  </div>
                )}
                {caregiver.religion && (
                  <div>
                    <h3 className="font-medium text-gray-900">Religion</h3>
                    <p className="text-gray-600">{caregiver.religion}</p>
                  </div>
                )}
                {caregiver.availability && Array.isArray(caregiver.availability.days) && caregiver.availability.days.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Schedule</h3>
                    <p className="text-gray-600 mb-1">Available Days: {caregiver.availability.days.join(', ')}</p>
                    {Array.isArray(caregiver.availability.timeSlots) && caregiver.availability.timeSlots[0] && (
                      <p className="text-gray-600">Time: {caregiver.availability.timeSlots[0].startTime} - {caregiver.availability.timeSlots[0].endTime}</p>
                    )}
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