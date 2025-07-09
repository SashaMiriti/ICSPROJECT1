import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, loadingUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;

  // Always show TogetherCare logo/text on the left
  const logo = (
    <Link to="/" className="flex-shrink-0 flex items-center mr-8">
      <span className="text-2xl font-bold text-primary-600">TogetherCare</span>
    </Link>
  );

  if (loadingUser) return null;

  // Only show caregiver navbar on /caregiver/* routes
  const isCaregiverRoute = location.pathname.startsWith('/caregiver/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Caregiver navbar only on /caregiver/*
  if (user && user.role === 'caregiver' && isCaregiverRoute) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center w-full h-16">
            {logo}
            <div className="flex flex-1 justify-center space-x-8">
              <Link to="/caregiver/dashboard" className="text-base font-medium text-gray-700 hover:text-green-700">Dashboard</Link>
              <Link to="/caregiver/schedule" className="text-base font-medium text-gray-700 hover:text-pink-700">My Schedule</Link>
              <Link to="/caregiver/profile" className="text-base font-medium text-gray-700 hover:text-purple-700">My Profile</Link>
              <Link to="/caregiver/bookings" className="text-base font-medium text-gray-700 hover:text-blue-700">My Bookings</Link>
              <Link to="/caregiver/reviews" className="text-base font-medium text-gray-700 hover:text-yellow-700">My Reviews</Link>
            </div>
            <div className="ml-6 flex items-center relative">
              <button
                className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold shadow focus:outline-none"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                {user?.username?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-12 w-40 bg-white rounded-lg shadow-lg z-20">
                  <Link
                    to="/caregiver/profile"
                    className="block w-full text-left px-4 py-2 hover:bg-green-100 text-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-green-100 text-gray-700"
                    onClick={() => { handleLogout(); setDropdownOpen(false); }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Only show minimal navbar on home page
  const isHome = location.pathname === '/';
  if (isHome) {
    return (
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {logo}
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
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
  }

  // Default: Sign In and Sign Up, always show logo on left
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {logo}
          <div className="flex items-center">
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
                  to="/care-seeker/bookings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/bookings') ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:border-blue-700 hover:text-blue-700'}`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/care-seeker/search"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/care-seeker/search') ? 'border-pink-700 text-pink-700' : 'border-transparent text-gray-500 hover:border-pink-700 hover:text-pink-700'}`}
                >
                  Search Caregivers
                </Link>
              </div>
            )}
            {user && user.role === 'caregiver' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/caregiver/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/caregiver/dashboard') ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:border-green-700 hover:text-green-700'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/caregiver/schedule"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/caregiver/schedule') ? 'border-pink-700 text-pink-700' : 'border-transparent text-gray-500 hover:border-pink-700 hover:text-pink-700'}`}
                >
                  My Schedule
                </Link>
                <Link
                  to="/caregiver/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/caregiver/profile') ? 'border-purple-700 text-purple-700' : 'border-transparent text-gray-500 hover:border-purple-700 hover:text-purple-700'}`}
                >
                  My Profile
                </Link>
                <Link
                  to="/caregiver/bookings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/caregiver/bookings') ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-500 hover:border-blue-700 hover:text-blue-700'}`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/caregiver/reviews"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/caregiver/reviews') ? 'border-yellow-700 text-yellow-700' : 'border-transparent text-gray-500 hover:border-yellow-700 hover:text-yellow-700'}`}
                >
                  My Reviews
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {(user.role === 'careSeeker' || user.role === 'caregiver') && (
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