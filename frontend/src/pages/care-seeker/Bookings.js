import React from 'react';
import { Link } from 'react-router-dom';

const mockBookings = [
  {
    id: 1,
    caregiver: {
      id: 1,
      name: 'Jane Smith',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '17:00',
    status: 'confirmed',
    serviceType: 'Elderly Care',
  },
  {
    id: 2,
    caregiver: {
      id: 2,
      name: 'John Davis',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    },
    date: '2024-03-25',
    startTime: '10:00',
    endTime: '14:00',
    status: 'pending',
    serviceType: 'Special Needs Care',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const statusStyles = {
  confirmed: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function Bookings({ bookings = [] }) {
  // Placeholder bookings for demonstration
  bookings = bookings.length ? bookings : [
    { id: 1, caregiver: 'Jane Doe', date: '2024-07-01', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, caregiver: 'John Smith', date: '2024-07-05', time: '2:00 PM', status: 'Pending' },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8" aria-label="Bookings List">
      <h2 className="text-2xl font-bold mb-6 text-gray-900" tabIndex={0}>My Bookings</h2>
      <table className="w-full text-lg border-collapse" aria-label="Bookings Table">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">Caregiver</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Time</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-3">{b.caregiver}</td>
              <td className="p-3">{b.date}</td>
              <td className="p-3">{b.time}</td>
              <td className={b.status === 'Confirmed' ? 'p-3 text-green-700' : 'p-3 text-yellow-700'}>{b.status}</td>
              <td className="p-3">
                <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label={`View details for booking with ${b.caregiver}`}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 