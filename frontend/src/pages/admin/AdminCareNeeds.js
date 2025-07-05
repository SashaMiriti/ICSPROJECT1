import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminCareNeeds() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [careNeeds, setCareNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCareNeeds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access admin dashboard');
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/care-needs', {
        headers: { 'x-auth-token': token }
      });
      setCareNeeds(response.data);

    } catch (error) {
      console.error('Error fetching care needs:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
      } else {
        toast.error('Failed to load care needs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareNeeds();
  }, []);

  const handleDeleteCareNeed = async (careNeedId, careNeedTitle) => {
    if (!window.confirm(`Are you sure you want to delete care need "${careNeedTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/care-needs/${careNeedId}`, {
        headers: { 'x-auth-token': token }
      });

      toast.success('Care need deleted successfully');
      fetchCareNeeds(); // Refresh data
    } catch (error) {
      console.error('Error deleting care need:', error);
      toast.error('Failed to delete care need');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredCareNeeds = careNeeds.filter(careNeed => {
    return careNeed.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           careNeed.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           careNeed.careSeeker?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Care Needs Management</h2>
        <p className="text-gray-600">Manage all care needs in the system</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Care Needs</label>
          <input
            type="text"
            placeholder="Search by title, description, or care seeker name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Care Needs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Care Needs ({filteredCareNeeds.length} of {careNeeds.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Care Need
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Care Seeker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCareNeeds.map((careNeed) => (
                <tr key={careNeed._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {careNeed.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {careNeed.careSeeker?.fullName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {careNeed.description || 'No description'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(careNeed.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteCareNeed(careNeed._id, careNeed.title)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCareNeeds.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No care needs found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 