import React from 'react';
import { useParams, Link } from 'react-router-dom';

const mockCaregiver = {
  id: 1,
  name: 'Jane Smith',
  rating: 4.8,
  reviews: 24,
  experience: '5 years',
  services: ['Elderly Care', 'Medication Management'],
  hourlyRate: 25,
  location: 'San Francisco, CA',
  imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  bio: 'Dedicated caregiver with extensive experience in elderly care and medication management. Certified nursing assistant with a passion for helping others.',
  certifications: ['Certified Nursing Assistant (CNA)', 'First Aid Certified', 'CPR Certified'],
  availability: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
  },
};

export default function CaregiverProfile() {
  const { id } = useParams();

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full"
                  src={mockCaregiver.imageUrl}
                  alt=""
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-6 text-gray-900">
                  {mockCaregiver.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {mockCaregiver.location}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">
                    {mockCaregiver.rating} ({mockCaregiver.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">About</dt>
                <dd className="mt-1 text-sm text-gray-900">{mockCaregiver.bio}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Experience</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {mockCaregiver.experience}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${mockCaregiver.hourlyRate}/hour
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Services</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {mockCaregiver.services.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Certifications
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="list-disc pl-5">
                    {mockCaregiver.certifications.map((cert) => (
                      <li key={cert}>{cert}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Availability</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(mockCaregiver.availability).map(
                      ([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span>{hours}</span>
                        </div>
                      )
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:px-6">
            <div className="flex justify-end space-x-4">
              <Link
                to={`/care-seeker/booking/${id}`}
                className="inline-flex justify-center rounded-md bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 