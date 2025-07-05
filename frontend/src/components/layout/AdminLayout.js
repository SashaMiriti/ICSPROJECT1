import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex-shrink-0 flex items-center mr-8">
                <span className="text-2xl font-bold text-primary-600">TogetherCare Admin</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-green-700 hover:text-green-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/pending-caregivers"
                  className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-purple-700 hover:text-purple-700"
                >
                  Pending Caregivers
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user && user.role === 'admin' && (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-medium">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 p-6">
        {children}
      </main>
      <footer className="bg-white text-center py-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
      </footer>
    </div>
  );
}
