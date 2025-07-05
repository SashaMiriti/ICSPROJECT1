// src/components/PendingCaregiver.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const isImageFile = (filename) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(filename);
};

const PendingCaregiver = () => {
  const [pendingCaregivers, setPendingCaregivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('/api/admin/pending-caregivers')
      .then(res => setPendingCaregivers(res.data))
      .catch(err => console.error('Error fetching pending caregivers:', err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Pending Caregivers</h2>

      {pendingCaregivers.length === 0 ? (
        <p className="text-gray-600">No pending caregivers 🎉</p>
      ) : (
        <div className="grid gap-4">
          {pendingCaregivers.map(caregiver => (
            <Card key={caregiver._id}>
              <CardContent className="p-4 flex flex-col gap-2">
                <p><strong>Name:</strong> {caregiver.username || caregiver.name || caregiver.fullName}</p>
                <p><strong>Email:</strong> {caregiver.email}</p>
                {caregiver.phone && <p><strong>Phone:</strong> {caregiver.phone}</p>}
                {caregiver.location && (
                  <p><strong>Address:</strong> {typeof caregiver.location === 'string' ? caregiver.location : caregiver.location.address}</p>
                )}
                {caregiver.experienceYears !== undefined && (
                  <p><strong>Experience:</strong> {caregiver.experienceYears} years</p>
                )}
                {caregiver.specializationCategory && (
                  <p><strong>Specialization:</strong> {caregiver.specializationCategory}</p>
                )}
                {caregiver.qualifications && caregiver.qualifications.length > 0 && (
                  <p><strong>Qualifications:</strong> {caregiver.qualifications.join(', ')}</p>
                )}
                {caregiver.servicesOffered && caregiver.servicesOffered.length > 0 && (
                  <p><strong>Services Offered:</strong> {caregiver.servicesOffered.join(', ')}</p>
                )}
                {caregiver.languagesSpoken && caregiver.languagesSpoken.length > 0 && (
                  <p><strong>Languages:</strong> {caregiver.languagesSpoken.join(', ')}</p>
                )}
                {caregiver.gender && (
                  <p><strong>Gender:</strong> {caregiver.gender}</p>
                )}
                {caregiver.hourlyRate && (
                  <p><strong>Hourly Rate:</strong> Ksh {caregiver.hourlyRate}</p>
                )}
                {caregiver.bio && (
                  <p><strong>Bio:</strong> {caregiver.bio}</p>
                )}
                <p><strong>Verified:</strong> {caregiver.isVerified ? 'Yes' : 'No'}</p>
                <p><strong>Profile Complete:</strong> {caregiver.profileComplete ? 'Yes' : 'No'}</p>
                {Array.isArray(caregiver.documents) && caregiver.documents.length > 0 && (
                  <div>
                    <strong>Certifications:</strong>
                    <ul className="list-disc ml-6 flex flex-wrap gap-4 mt-2">
                      {caregiver.documents.map((doc, idx) => (
                        <li key={idx} className="flex flex-col items-start">
                          {isImageFile(doc.filename) ? (
                            <a
                              href={`http://localhost:5000/uploads/${doc.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`http://localhost:5000/uploads/${doc.filename}`}
                                alt={doc.filename.split('/').pop()}
                                className="w-24 h-24 object-cover rounded border mb-1"
                              />
                              <span className="text-xs text-gray-700">{doc.filename.split('/').pop()} ({doc.status})</span>
                            </a>
                          ) : (
                            <a
                              href={`http://localhost:5000/uploads/${doc.filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {doc.filename.split('/').pop()} ({doc.status})
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => navigate(`/admin/caregiver/${caregiver._id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCaregiver;
