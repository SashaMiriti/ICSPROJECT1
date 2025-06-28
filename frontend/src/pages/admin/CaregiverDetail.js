// src/pages/admin/CaregiverDetail.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const CaregiverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);

  useEffect(() => {
  axios.get(`/admin/caregiver/${id}`)
    .then(res => {
      console.log("Full caregiver data:", res.data); // ← Add this line
      setCaregiver(res.data);
    })
    .catch(() => setCaregiver(null));
}, [id]);

  const handleAction = async (action) => {
    try {
      await axios.put(`/admin/${action}-caregiver/${id}`);
      navigate('/admin/pending-caregivers');
    } catch (err) {
      console.error(`Failed to ${action} caregiver`, err);
      alert('An error occurred. Please try again.');
    }
  };

  if (!caregiver) return <p className="p-4 text-gray-600">Loading caregiver details...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">Caregiver Details</h2>

          <p><strong>Name:</strong> {caregiver.username}</p>
          <p><strong>Email:</strong> {caregiver.email}</p>
          <p><strong>Phone:</strong> {caregiver.phone}</p>
          <p><strong>Status:</strong> {caregiver.status}</p>

          {caregiver.bio && <p><strong>Bio:</strong> {caregiver.bio}</p>}

          {caregiver.location?.address && (
            <p><strong>Location:</strong> {caregiver.location.address}</p>
          )}

          {caregiver.documents && caregiver.documents.length > 0 ? (
  <div>
    <strong>Certification Document:</strong>{' '}
    <a
      href={`http://localhost:5000/uploads/${caregiver.documents[0].filename}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      View Document
    </a>
  </div>
) : (
  <p className="text-gray-500">No certification uploaded.</p>
)}

          <div className="flex gap-4 mt-6">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction('reject')}
            >
              Reject
            </Button>
            <button
              onClick={() => navigate('/admin/pending-caregivers')}
              className="border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
            >
              Back to Pending List
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaregiverDetail;
