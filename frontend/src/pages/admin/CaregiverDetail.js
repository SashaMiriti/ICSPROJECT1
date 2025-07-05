// src/pages/admin/CaregiverDetail.js

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

// Utility function to get the correct image URL
const getImageUrl = (filename) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/certifications/${filename}`;
};

const isImageFile = (filename) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(filename);
};

const CaregiverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCaregiverDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Please log in to access admin dashboard');
        navigate('/login');
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/admin/caregiver/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setCaregiver(res.data);
    } catch (error) {
      console.error('Error fetching caregiver details:', error);
      if (error.response?.status === 403) {
        setMessage('Access denied. Admin privileges required.');
        navigate('/');
      } else {
        setMessage('Error loading caregiver details');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCaregiverDetails();
  }, [id, fetchCaregiverDetails]);

  const handleToggleVerification = async () => {
    try {
      setUpdating(true);
      const newVerificationStatus = !caregiver.isVerified;
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/admin/toggle-verification/${id}`, {
        isVerified: newVerificationStatus
      }, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setCaregiver(prev => ({
        ...prev,
        isVerified: newVerificationStatus,
        status: newVerificationStatus ? 'approved' : 'pending'
      }));
      
      setMessage(`Caregiver ${newVerificationStatus ? 'verified' : 'unverified'} successfully`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling verification:', error);
      setMessage('Error updating verification status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAction = async (action) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/admin/${action}-caregiver/${id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      navigate('/admin/pending-caregivers');
    } catch (err) {
      console.error(`Failed to ${action} caregiver`, err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading caregiver details...</p>
        </div>
      </div>
    );
  }

  if (!caregiver) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center text-red-600">
          <p>Caregiver not found</p>
          <button
            onClick={() => navigate('/admin/pending-caregivers')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Pending List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Caregiver Profile</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/pending-caregivers')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Full Name:</span>
                <span>{caregiver.fullName || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{caregiver.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{caregiver.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{caregiver.phone || caregiver.contactNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gender:</span>
                <span>{caregiver.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  caregiver.status === 'approved' ? 'bg-green-100 text-green-800' :
                  caregiver.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {caregiver.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Verified:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  caregiver.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {caregiver.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Profile Complete:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  caregiver.profileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {caregiver.profileComplete ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Professional Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Experience:</span>
                <span>{caregiver.experienceYears ? `${caregiver.experienceYears} years` : 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Specialization:</span>
                <span>{caregiver.specializationCategory || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Hourly Rate:</span>
                <span>{caregiver.hourlyRate ? `Ksh ${caregiver.hourlyRate}` : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price Type:</span>
                <span>{caregiver.priceType || 'Not specified'}</span>
              </div>
              {caregiver.qualifications && caregiver.qualifications.length > 0 && (
                <div>
                  <span className="font-medium">Qualifications:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {caregiver.qualifications.map((qual, idx) => (
                      <li key={idx}>{qual}</li>
                    ))}
                  </ul>
                </div>
              )}
              {caregiver.servicesOffered && caregiver.servicesOffered.length > 0 && (
                <div>
                  <span className="font-medium">Services Offered:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {caregiver.servicesOffered.map((service, idx) => (
                      <li key={idx}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cultural & Language Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Cultural & Language Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Culture:</span>
                <span>{caregiver.culture || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Religion:</span>
                <span>{caregiver.religion || 'Not specified'}</span>
              </div>
              {caregiver.languagesSpoken && caregiver.languagesSpoken.length > 0 && (
                <div>
                  <span className="font-medium">Languages Spoken:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {caregiver.languagesSpoken.map((lang, idx) => (
                      <li key={idx}>{lang}</li>
                    ))}
                  </ul>
                </div>
              )}
              {caregiver.tribalLanguage && (
                <div className="flex justify-between">
                  <span className="font-medium">Tribal Language:</span>
                  <span>{caregiver.tribalLanguage}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location & Availability */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Location & Availability</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Location:</span>
                <p className="mt-1 text-gray-700">
                  {caregiver.location?.address || 'Not specified'}
                </p>
              </div>
              {caregiver.availability && (
                <div>
                  <span className="font-medium">Availability:</span>
                  {caregiver.availability.days && caregiver.availability.days.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Available Days:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {caregiver.availability.days.map((day, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                      {caregiver.availability.timeSlots && caregiver.availability.timeSlots[0] && (
                        <p className="text-sm text-gray-600 mt-2">
                          Time: {caregiver.availability.timeSlots[0].startTime} - {caregiver.availability.timeSlots[0].endTime}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-1">No availability set</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {caregiver.bio && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Bio</h2>
            <p className="text-gray-700 leading-relaxed">{caregiver.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">Certifications & Documents</h2>
            <span className="text-sm text-gray-600">
              {caregiver.documents?.length || 0} document{(caregiver.documents?.length || 0) !== 1 ? 's' : ''} uploaded
            </span>
          </div>
          {caregiver.documents && caregiver.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caregiver.documents.map((doc, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
                  {isImageFile(doc.filename) ? (
                    <div className="text-center">
                      <a
                        href={getImageUrl(doc.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={getImageUrl(doc.filename)}
                          alt={doc.originalName || doc.filename.split('/').pop()}
                          className="w-full h-48 object-cover rounded border mb-2 hover:opacity-90 transition"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-full h-48 bg-gray-100 rounded border mb-2 flex items-center justify-center" style={{ display: 'none' }}>
                          <div className="text-center">
                            <span className="text-2xl text-gray-500">❌</span>
                            <p className="text-xs text-gray-600 mt-1">Image not found</p>
                          </div>
                        </div>
                      </a>
                      <p className="text-sm text-gray-700 font-medium">
                        {doc.originalName || doc.filename.split('/').pop()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <a
                        href={getImageUrl(doc.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        <div className="w-full h-48 bg-gray-100 rounded border mb-2 flex items-center justify-center hover:bg-gray-200 transition">
                          <div className="text-center">
                            <span className="text-4xl text-gray-500">📄</span>
                            <p className="text-xs text-gray-600 mt-1">View Document</p>
                          </div>
                        </div>
                      </a>
                      <p className="text-sm text-gray-700 font-medium">
                        {doc.originalName || doc.filename.split('/').pop()}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500">No certifications uploaded.</p>
              <p className="text-sm text-gray-400 mt-1">This caregiver hasn't uploaded any documents yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">Admin Actions</h2>
            <div className="text-sm text-gray-600">
              Current Status: 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                caregiver.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {caregiver.isVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              className={`${
                caregiver.isVerified 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white h-12 text-base`}
              onClick={handleToggleVerification}
              disabled={updating}
            >
              {updating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : caregiver.isVerified ? (
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  Remove Verification
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  Verify Caregiver
                </div>
              )}
            </Button>
            
            {!caregiver.isVerified && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white h-12 text-base"
                  onClick={() => handleAction('approve')}
                  disabled={updating}
                >
                  <div className="flex items-center">
                    <span className="mr-2">👍</span>
                    Approve & Verify
                  </div>
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white h-12 text-base"
                  onClick={() => handleAction('reject')}
                  disabled={updating}
                >
                  <div className="flex items-center">
                    <span className="mr-2">❌</span>
                    Reject Application
                  </div>
                </Button>
              </>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Verification Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Review all uploaded documents and certifications</li>
              <li>• Verify contact information and professional details</li>
              <li>• Check experience and qualifications match requirements</li>
              <li>• Ensure profile completeness and accuracy</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Profile Created:</span>
              <p className="text-gray-700">
                {new Date(caregiver.createdAt).toLocaleDateString()} at {new Date(caregiver.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <p className="text-gray-700">
                {new Date(caregiver.updatedAt).toLocaleDateString()} at {new Date(caregiver.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaregiverDetail;
