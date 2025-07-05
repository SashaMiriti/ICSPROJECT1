// src/components/PendingCaregiver.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import toast from 'react-hot-toast';

// Utility function to get the correct image URL
const getImageUrl = (filename) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/certifications/${filename}`;
};

const isImageFile = (filename) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(filename);
};

const PendingCaregiver = () => {
  const [pendingCaregivers, setPendingCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const navigate = useNavigate();

  const fetchPendingCaregivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access admin dashboard');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/pending-caregivers', {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Pending caregivers data:', response.data); // Debug log
      setPendingCaregivers(response.data);
    } catch (error) {
      console.error('Error fetching pending caregivers:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Failed to load pending caregivers');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCaregivers();
  }, []);

  const handleToggleVerification = async (caregiverId, currentStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [caregiverId]: true }));
      const newVerificationStatus = !currentStatus;
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/admin/toggle-verification/${caregiverId}`, {
        isVerified: newVerificationStatus
      }, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setPendingCaregivers(prev => 
        prev.map(caregiver => 
          caregiver._id === caregiverId 
            ? { ...caregiver, isVerified: newVerificationStatus }
            : caregiver
        )
      );
      
      toast.success(`Caregiver ${newVerificationStatus ? 'verified' : 'unverified'} successfully`);
      
      // If verified, remove from pending list
      if (newVerificationStatus) {
        setPendingCaregivers(prev => prev.filter(c => c._id !== caregiverId));
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error('Error updating verification status');
    } finally {
      setUpdating(prev => ({ ...prev, [caregiverId]: false }));
    }
  };

  const handleAction = async (caregiverId, action) => {
    try {
      setUpdating(prev => ({ ...prev, [caregiverId]: true }));
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/admin/${action}-caregiver/${caregiverId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove from pending list
      setPendingCaregivers(prev => prev.filter(c => c._id !== caregiverId));
      toast.success(`Caregiver ${action}d successfully`);
    } catch (error) {
      console.error(`Failed to ${action} caregiver`, error);
      toast.error(`Failed to ${action} caregiver`);
    } finally {
      setUpdating(prev => ({ ...prev, [caregiverId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending caregivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Pending Caregivers</h2>
          <p className="text-gray-600 mt-1">Review and verify caregiver applications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
            {pendingCaregivers.length} caregiver{pendingCaregivers.length !== 1 ? 's' : ''} pending verification
          </div>
          <Button
            onClick={fetchPendingCaregivers}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      {pendingCaregivers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No pending caregivers</h3>
          <p className="text-gray-500 mb-4">All caregiver applications have been processed!</p>
          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingCaregivers.map(caregiver => (
            <Card key={caregiver._id} className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Full Name:</span>
                        <p className="text-gray-900 font-medium">{caregiver.fullName || caregiver.username || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Email:</span>
                        <p className="text-gray-900">{caregiver.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Phone:</span>
                        <p className="text-gray-900">{caregiver.phone || caregiver.contactNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Gender:</span>
                        <p className="text-gray-900">{caregiver.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Location:</span>
                        <p className="text-gray-900">{caregiver.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Registration Date:</span>
                        <p className="text-gray-900">
                          {new Date(caregiver.userCreatedAt || caregiver.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Professional Details
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Experience:</span>
                        <p className="text-gray-900">{caregiver.experienceYears ? `${caregiver.experienceYears} years` : 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Specialization:</span>
                        <p className="text-gray-900">{caregiver.specializationCategory || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Hourly Rate:</span>
                        <p className="text-gray-900">{caregiver.hourlyRate ? `Ksh ${caregiver.hourlyRate}` : 'Not set'}</p>
                      </div>
                      {caregiver.qualifications && caregiver.qualifications.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Qualifications:</span>
                          <ul className="list-disc ml-4 text-gray-900 text-sm">
                            {caregiver.qualifications.slice(0, 3).map((qual, idx) => (
                              <li key={idx}>{qual}</li>
                            ))}
                            {caregiver.qualifications.length > 3 && (
                              <li className="text-gray-600">... and {caregiver.qualifications.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {caregiver.servicesOffered && caregiver.servicesOffered.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Services:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {caregiver.servicesOffered.slice(0, 3).map((service, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {service}
                              </span>
                            ))}
                            {caregiver.servicesOffered.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{caregiver.servicesOffered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certifications & Actions */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Certifications & Actions
                    </h3>
                    
                    {/* Certifications Preview */}
                    {Array.isArray(caregiver.documents) && caregiver.documents.length > 0 ? (
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Documents ({caregiver.documents.length}):</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {caregiver.documents.slice(0, 4).map((doc, idx) => (
                            <div key={idx} className="text-center">
                              {isImageFile(doc.filename) ? (
                                <a
                                  href={getImageUrl(doc.filename)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group"
                                >
                                  <img
                                    src={getImageUrl(doc.filename)}
                                    alt={doc.originalName || doc.filename.split('/').pop()}
                                    className="w-16 h-16 object-cover rounded border group-hover:opacity-80 transition"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center" style={{ display: 'none' }}>
                                    <span className="text-xs text-gray-600">❌</span>
                                  </div>
                                </a>
                              ) : (
                                <a
                                  href={getImageUrl(doc.filename)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-16 h-16 bg-gray-100 rounded border flex items-center justify-center hover:bg-gray-200 transition"
                                >
                                  <span className="text-xs text-gray-600">📄</span>
                                </a>
                              )}
                              <span className={`inline-block px-1 py-0.5 rounded text-xs mt-1 ${
                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                          ))}
                          {caregiver.documents.length > 4 && (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{caregiver.documents.length - 4}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No documents uploaded</p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 mt-4">
                      <Button
                        onClick={() => navigate(`/admin/caregiver/${caregiver._id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        View Full Details
                      </Button>
                      
                      <Button
                        onClick={() => handleToggleVerification(caregiver._id, caregiver.isVerified)}
                        disabled={updating[caregiver._id]}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updating[caregiver._id] ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="mr-2">✅</span>
                            Verify Caregiver
                          </div>
                        )}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(caregiver._id, 'approve')}
                          disabled={updating[caregiver._id]}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleAction(caregiver._id, 'reject')}
                          disabled={updating[caregiver._id]}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio (if available) */}
                {caregiver.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Bio:</span>
                    <p className="text-gray-900 mt-1 text-sm line-clamp-2">{caregiver.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCaregiver;
