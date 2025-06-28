import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function UploadDocuments() {
  const { user, token } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/caregivers/profile', {
          headers: { 'x-auth-token': token }
        });
        setDocuments(res.data.documents || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    if (user?.role === 'caregiver') {
      fetchProfile();
    }
  }, [token, user]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage('Please select at least one document to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('documents', file));

    try {
      const res = await axios.post('http://localhost:5000/api/caregivers/upload-docs', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(res.data.message || 'Documents uploaded.');
      setSelectedFiles([]);
      // Refetch documents to update status
      const profile = await axios.get('http://localhost:5000/api/caregivers/profile', {
        headers: { 'x-auth-token': token }
      });
      setDocuments(profile.data.documents || []);
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4 flex flex-col items-center">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-xl w-full">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Upload Verification Documents</h1>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4"
          accept=".pdf,.jpg,.jpeg,.png"
        />

        <button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300"
        >
          {isUploading ? 'Uploading...' : 'Upload Documents'}
        </button>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Uploaded Documents:</h2>
          {documents.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              {documents.map((doc, index) => (
                <li key={index}>
                  {doc.filename} - <strong className={
                    doc.status === 'approved' ? 'text-green-600' :
                    doc.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }>{doc.status}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
