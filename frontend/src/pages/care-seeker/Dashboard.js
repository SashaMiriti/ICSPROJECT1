    // frontend/src/pages/care-seeker/Dashboard.js
    import React from 'react';
    import { Link } from 'react-router-dom';

    export default function CareSeekerDashboard() {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-xl w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-4" tabIndex={0}>Care Seeker Dashboard</h1>
            <p className="text-gray-700 mb-6 text-lg">Welcome! What would you like to do today?</p>
            <div className="flex flex-col gap-6 mb-6">
              <Link to="/care-seeker/needs" className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label="Start a new caregiver search">Start a New Caregiver Search</Link>
              <Link to="/care-seeker/bookings" className="w-full bg-blue-700 text-white text-xl font-bold py-4 rounded hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400" aria-label="View my bookings">View My Bookings</Link>
              <Link to="/care-seeker/feedback" className="w-full bg-yellow-700 text-white text-xl font-bold py-4 rounded hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label="Give feedback">Give Feedback</Link>
              <Link to="/care-seeker/profile" className="w-full bg-gray-700 text-white text-xl font-bold py-4 rounded hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400" aria-label="View or edit my profile">View/Edit My Profile</Link>
            </div>
            <div className="mt-4 text-base text-gray-500" aria-live="polite">
              Need help? <a href="/about" className="text-blue-700 underline">Learn more about TogetherCare</a>
            </div>
          </div>
        </div>
      );
    }
    