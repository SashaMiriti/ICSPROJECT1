// src/pages/LandingPage.js (create this file if it doesn't exist)
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-white flex flex-col">
      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary-700 mb-4 tracking-tight drop-shadow-lg">
          TogetherCare
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-6 max-w-2xl mx-auto font-medium">
          Empowering Connections for Personalized and Quality In-Home Care and Support
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link to="/register">
            <button className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-200">
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-white border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-bold py-3 px-8 rounded-lg text-lg shadow transition-all duration-200">
              Sign In
            </button>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-12 px-4 shadow-inner">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 text-green-700 rounded-full p-4 mb-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-700">Trusted & Vetted Caregivers</h3>
            <p className="text-gray-600">All caregivers are background-checked and approved by our team for your peace of mind.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-purple-100 text-purple-700 rounded-full p-4 mb-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 8v8" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-700">Personalized Matching</h3>
            <p className="text-gray-600">Smart algorithms connect you with caregivers who best fit your needs, location, and preferences.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 text-green-700 rounded-full p-4 mb-4">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-primary-700">Safe & Supportive Community</h3>
            <p className="text-gray-600">We foster a caring, inclusive environment for both caregivers and those seeking care.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-green-100 via-purple-100 to-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">Ready to experience quality in-home care?</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">Join TogetherCare today and connect with trusted caregivers or find meaningful work supporting others in your community.</p>
        <Link to="/register">
          <button className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold py-3 px-10 rounded-lg text-xl shadow-lg transition-all duration-200">
            Join Now
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
      </footer>
    </div>
  );
}
