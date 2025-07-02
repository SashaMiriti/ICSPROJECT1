// src/components/PendingCaregiver.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

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
                <p><strong>Name:</strong> {caregiver.username || caregiver.name}</p>
                <p><strong>Email:</strong> {caregiver.email}</p>

                {caregiver.bio && (
                  <p><strong>Bio:</strong> {caregiver.bio}</p>
                )}

                {caregiver.certificationPath && (
                  <div>
                    <strong>Certification:</strong>{' '}
                    <a
                      href={`http://localhost:5000/${caregiver.certificationPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
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
