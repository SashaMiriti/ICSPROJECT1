// src/components/layout/Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">
            <Link to="/">TogetherCare</Link>
          </h1>
          <nav className="space-x-4">
            <Link to="/about" className="text-gray-600 hover:text-green-600">About</Link>
            <Link to="/login" className="text-green-600 font-medium hover:underline">Login</Link>
            <Link to="/register" className="text-green-600 font-medium hover:underline">Register</Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
      </footer>
    </div>
  );
}
