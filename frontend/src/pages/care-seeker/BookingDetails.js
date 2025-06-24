import React from 'react';

export default function BookingDetails({ booking, onConfirm, onCancel }) {
  // Placeholder props for demonstration
  booking = booking || { status: 'Pending', caregiver: { name: 'Jane Doe', phone: '123-456-7890' }, date: '2024-07-01', time: '10:00 AM', notes: 'N/A' };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8" aria-label="Booking Details">
      <h2 className="text-2xl font-bold mb-4 text-gray-900" tabIndex={0}>Booking Details</h2>
      <div className="mb-4 text-lg" aria-live="polite">
        <strong>Status:</strong> <span className={booking.status === 'Confirmed' ? 'text-green-700' : 'text-yellow-700'}>{booking.status}</span>
      </div>
      <div className="mb-4 text-lg">
        <strong>Caregiver:</strong> {booking.caregiver.name}
      </div>
      <div className="mb-4 text-lg">
        <strong>Date:</strong> {booking.date}
      </div>
      <div className="mb-4 text-lg">
        <strong>Time:</strong> {booking.time}
      </div>
      <div className="mb-4 text-lg">
        <strong>Notes:</strong> {booking.notes}
      </div>
      <div className="mb-6 text-lg">
        <strong>Contact:</strong> <a href={`tel:${booking.caregiver.phone}`} className="text-blue-700 underline" aria-label={`Call ${booking.caregiver.name}`}>{booking.caregiver.phone}</a>
      </div>
      <div className="flex flex-col gap-4">
        {booking.status === 'Pending' && (
          <>
            <button onClick={onConfirm} className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label="Confirm Booking">Confirm Booking</button>
            <button onClick={onCancel} className="w-full bg-red-700 text-white text-xl font-bold py-4 rounded hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-400" aria-label="Cancel Booking">Cancel Booking</button>
          </>
        )}
        {booking.status === 'Confirmed' && (
          <span className="text-green-800 text-xl font-bold" aria-live="polite">Your booking is confirmed!</span>
        )}
      </div>
    </div>
  );
} 