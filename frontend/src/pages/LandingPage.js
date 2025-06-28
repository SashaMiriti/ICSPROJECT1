// src/pages/LandingPage.js (create this file if it doesn't exist)
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-primary-600 mb-6">Welcome to TogetherCare</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        A platform to connect caregivers with care seekers.
      </p>
      <div className="space-x-4">
        <Link to="/register">
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-md">
            Sign Up
          </button>
        </Link>
        <Link to="/login">
          <button className="bg-white border border-primary-600 text-primary-600 hover:bg-primary-100 font-semibold py-2 px-6 rounded-md">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}
