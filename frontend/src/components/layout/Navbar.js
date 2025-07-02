import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/care-seeker/dashboard" className="flex-shrink-0 flex items-center mr-8">
              <span className="text-2xl font-bold text-primary-600">TogetherCare</span>
            </Link>
            {user && user.role === 'careSeeker' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/care-seeker/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/dashboard') ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:border-purple-700 hover:text-purple-700'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/care-seeker/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/profile') ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:border-green-700 hover:text-green-700'}`}
                >
                  My Profile
                </Link>
                <Link
                  to="/care-seeker/search"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/search') ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:border-blue-700 hover:text-blue-700'}`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/care-seeker/feedback"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/feedback') ? 'border-yellow-700 text-yellow-700' : 'border-transparent text-gray-500 hover:border-yellow-700 hover:text-yellow-700'}`}
                >
                  Give Feedback
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'careSeeker' && (
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 