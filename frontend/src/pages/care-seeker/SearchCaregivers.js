import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SearchCaregivers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    service: '',
    maxRate: '',
  });
  const [matchedCaregivers, setMatchedCaregivers] = useState([]);
  const [allCaregivers, setAllCaregivers] = useState([]);

  useEffect(() => {
    // Get matched caregivers from navigation state
    if (location.state && location.state.matchedCaregivers) {
      setMatchedCaregivers(location.state.matchedCaregivers);
    }
    // Fetch all caregivers
    axios.get('http://localhost:5000/api/caregivers')
      .then(res => setAllCaregivers(res.data))
      .catch(() => setAllCaregivers([]));
  }, [location.state]);

  // Filter caregivers based on search term and filters
  const filterCaregivers = (caregivers) => caregivers.filter(caregiver => {
    const matchesSearch = !searchTerm || 
      caregiver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      caregiver.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = !filters.service || 
      caregiver.specializations?.some(s => s.toLowerCase().includes(filters.service.toLowerCase()));
    const matchesRate = !filters.maxRate || 
      (caregiver.hourlyRate && caregiver.hourlyRate <= parseInt(filters.maxRate));
    return matchesSearch && matchesService && matchesRate;
  });

  const handleViewProfile = (id) => {
    navigate(`/care-seeker/caregiver/${id}`);
  };

  const handleBook = (id) => {
    navigate(`/care-seeker/booking/${id}`);
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Matched Caregivers</h1>
        <p className="text-gray-600 mt-2 mb-6">
          Based on your profile and care needs, here are the best caregivers for you.
        </p>
        <div className="mt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search caregivers
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Search by name, service, or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <select
                id="service"
                name="service"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <option value="">All Services</option>
                <option value="elderly">Elderly Care</option>
                <option value="special">Special Needs Care</option>
                <option value="child">Child Care</option>
              </select>
            </div>
            <div className="w-48">
              <select
                id="maxRate"
                name="maxRate"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
              >
                <option value="">Max Hourly Rate</option>
                <option value="25">Ksh 25/hr</option>
                <option value="50">Ksh 50/hr</option>
                <option value="75">Ksh 75/hr</option>
                <option value="100">Ksh 100/hr</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matched Caregivers Container */}
        <div className="max-w-4xl mx-auto mt-8" aria-label="Matched Caregiver Results">
          <h2 className="text-xl font-bold mb-4 text-green-700">Matched Caregivers</h2>
          {filterCaregivers(matchedCaregivers).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No matched caregivers found.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filterCaregivers(matchedCaregivers).map((c) => (
                <div key={c._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center" aria-label={`Caregiver ${c.fullName}`} tabIndex={0}>
                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-3xl text-gray-600" aria-hidden="true">
                    {c.fullName ? c.fullName[0] : 'C'}
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-2">{c.fullName || 'Caregiver'}</div>
                  <div className="text-lg text-gray-700 mb-1">Experience: {c.experienceYears || 'Not specified'} years</div>
                  <div className="text-lg text-gray-700 mb-1">Rating: {c.rating || 'No ratings'} / 5</div>
                  <div className="text-gray-600 mb-4 text-center">{c.bio || 'No bio available'}</div>
                  {c.specializations && c.specializations.length > 0 && (
                    <div className="text-sm text-gray-500 mb-4">
                      <strong>Specializations:</strong> {c.specializations.join(', ')}
                    </div>
                  )}
                  <div className="text-lg text-gray-700 mb-1">Rate: Ksh {c.hourlyRate || 'Not specified'}/hr</div>
                  <div className="text-gray-600 mb-4">{c.location?.address || 'Location not specified'}</div>
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => handleViewProfile(c._id)} 
                      className="flex-1 bg-blue-700 text-white text-lg font-bold py-3 rounded hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400" 
                      aria-label={`View profile of ${c.fullName}`}
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleBook(c._id)} 
                      className="flex-1 bg-green-700 text-white text-lg font-bold py-3 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" 
                      aria-label={`Book ${c.fullName}`} 
                      disabled={!c.isAvailable} 
                      aria-disabled={!c.isAvailable}
                    >
                      {c.isAvailable ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Caregivers Container */}
        <div className="max-w-4xl mx-auto mt-12" aria-label="All Caregiver Results">
          <h2 className="text-xl font-bold mb-4 text-blue-700">All Caregivers</h2>
          {filterCaregivers(allCaregivers).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No caregivers found in the database.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filterCaregivers(allCaregivers).map((c) => (
                <div key={c._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center" aria-label={`Caregiver ${c.fullName}`} tabIndex={0}>
                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-3xl text-gray-600" aria-hidden="true">
                    {c.fullName ? c.fullName[0] : 'C'}
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-2">{c.fullName || 'Caregiver'}</div>
                  <div className="text-lg text-gray-700 mb-1">Experience: {c.experienceYears || 'Not specified'} years</div>
                  <div className="text-lg text-gray-700 mb-1">Rating: {c.rating || 'No ratings'} / 5</div>
                  <div className="text-gray-600 mb-4 text-center">{c.bio || 'No bio available'}</div>
                  {c.specializations && c.specializations.length > 0 && (
                    <div className="text-sm text-gray-500 mb-4">
                      <strong>Specializations:</strong> {c.specializations.join(', ')}
                    </div>
                  )}
                  <div className="text-lg text-gray-700 mb-1">Rate: Ksh {c.hourlyRate || 'Not specified'}/hr</div>
                  <div className="text-gray-600 mb-4">{c.location?.address || 'Location not specified'}</div>
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => handleViewProfile(c._id)} 
                      className="flex-1 bg-blue-700 text-white text-lg font-bold py-3 rounded hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400" 
                      aria-label={`View profile of ${c.fullName}`}
                    >
                      View Profile
                    </button>
                    <button 
                      onClick={() => handleBook(c._id)} 
                      className="flex-1 bg-green-700 text-white text-lg font-bold py-3 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" 
                      aria-label={`Book ${c.fullName}`} 
                      disabled={!c.isAvailable} 
                      aria-disabled={!c.isAvailable}
                    >
                      {c.isAvailable ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 