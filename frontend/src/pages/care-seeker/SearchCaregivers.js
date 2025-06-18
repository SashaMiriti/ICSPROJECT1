import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
  },
];

export default function SearchCaregivers() {
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {mockCaregivers.map((caregiver) => (
            <div
              key={caregiver.id}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
            >
              <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-sm font-medium text-gray-900">
                      {caregiver.name}
                    </h3>
                    <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {caregiver.rating} ★ ({caregiver.reviews})
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {caregiver.location}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Experience: {caregiver.experience}
                  </p>
                  <div className="mt-2">
                    {caregiver.services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20 mr-2"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <img
                  className="h-20 w-20 flex-shrink-0 rounded-full bg-gray-300"
                  src={caregiver.imageUrl}
                  alt=""
                />
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200">
                  <div className="flex w-0 flex-1">
                    <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                      ${caregiver.hourlyRate}/hour
                    </div>
                  </div>
                  <div className="-ml-px flex w-0 flex-1">
                    <Link
                      to={`/care-seeker/caregiver/${caregiver.id}`}
                      className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-primary-600 hover:text-primary-500"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 