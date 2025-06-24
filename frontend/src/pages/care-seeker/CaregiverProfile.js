import React from 'react';

const mockCaregiver = {
  id: 1,
  name: 'Jane Doe',
  rating: 4.8,
  reviews: [
    { id: 1, author: 'Sarah', rating: 5, comment: 'Wonderful and caring!' },
    { id: 2, author: 'Mike', rating: 4, comment: 'Very professional.' },
  ],
  experience: '5 years',
  services: ['Elderly Care', 'Medication Management'],
  hourlyRate: 25,
  location: 'San Francisco, CA',
  imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  bio: 'Experienced elderly caregiver with a passion for helping others.',
  certifications: ['Certified Nursing Assistant (CNA)', 'First Aid Certified', 'CPR Certified'],
  availability: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
  },
  available: true,
};

export default function CaregiverProfile({ onBook }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8" aria-label="Caregiver Profile">
      <h2 className="text-2xl font-bold mb-4 text-gray-900" tabIndex={0}>{mockCaregiver.name}</h2>
      <div className="mb-2 text-lg text-gray-700"><strong>Experience:</strong> {mockCaregiver.experience}</div>
      <div className="mb-2 text-lg text-gray-700"><strong>Rating:</strong> {mockCaregiver.rating} / 5</div>
      <div className="mb-4 text-gray-600">{mockCaregiver.bio}</div>
      <button onClick={onBook} className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400 mb-6" aria-label="Book this caregiver" disabled={!mockCaregiver.available} aria-disabled={!mockCaregiver.available}>
        {mockCaregiver.available ? 'Book Now' : 'Currently Unavailable'}
      </button>
      <div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">Reviews</h3>
        <ul className="space-y-4">
          {mockCaregiver.reviews.map((r) => (
            <li key={r.id} className="bg-gray-100 rounded p-4" aria-label={`Review by ${r.author}`} tabIndex={0}>
              <div className="font-semibold text-gray-800">{r.author}</div>
              <div className="text-yellow-700">Rating: {r.rating} / 5</div>
              <div className="text-gray-700 mt-1">{r.comment}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 