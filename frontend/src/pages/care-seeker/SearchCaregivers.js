import React, { useState } from 'react';

const mockCaregivers = [
  {
    id: 1,
    name: 'Jane Smith',
    rating: 4.8,
    reviews: 24,
    experience: '5 years',
    services: ['Elderly Care', 'Medication Management'],
    hourlyRate: 25,
    location: 'San Francisco, CA',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Experienced elderly caregiver.',
    available: true,
  },
  {
    id: 2,
    name: 'John Davis',
    rating: 4.9,
    reviews: 32,
    experience: '7 years',
    services: ['Special Needs Care', 'Physical Therapy'],
    hourlyRate: 30,
    location: 'San Francisco, CA',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    bio: 'Special needs care specialist.',
    available: false,
  },
];

export default function SearchCaregivers({ onViewProfile, onBook }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    service: '',
    maxRate: '',
  });

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Find Caregivers</h1>
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
                onChange={(e) =>
                  setFilters({ ...filters, service: e.target.value })
                }
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
                onChange={(e) =>
                  setFilters({ ...filters, maxRate: e.target.value })
                }
              >
                <option value="">Max Hourly Rate</option>
                <option value="25">$25/hr</option>
                <option value="50">$50/hr</option>
                <option value="75">$75/hr</option>
                <option value="100">$100/hr</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8" aria-label="Caregiver Search Results">
          <h2 className="text-2xl font-bold mb-6 text-gray-900" tabIndex={0}>Available Caregivers</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {mockCaregivers.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center" aria-label={`Caregiver ${c.name}`} tabIndex={0}>
                <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-3xl text-gray-600" aria-hidden="true">
                  {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="rounded-full w-full h-full object-cover" /> : c.name[0]}
                </div>
                <div className="text-xl font-bold text-gray-900 mb-2">{c.name}</div>
                <div className="text-lg text-gray-700 mb-1">Experience: {c.experience}</div>
                <div className="text-lg text-gray-700 mb-1">Rating: {c.rating} / 5</div>
                <div className="text-gray-600 mb-4 text-center">{c.bio}</div>
                <div className="flex gap-4 w-full">
                  <button onClick={() => onViewProfile && onViewProfile(c.id)} className="flex-1 bg-blue-700 text-white text-lg font-bold py-3 rounded hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400" aria-label={`View profile of ${c.name}`}>View Profile</button>
                  <button onClick={() => onBook && onBook(c.id)} className="flex-1 bg-green-700 text-white text-lg font-bold py-3 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label={`Book ${c.name}`} disabled={!c.available} aria-disabled={!c.available}>
                    {c.available ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 