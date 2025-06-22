import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Set up Axios base URL if it's not already configured globally
// This assumes your backend is running on localhost:5000
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Set the token directly to 'x-auth-token' header, as expected by your backend
      axios.defaults.headers.common['x-auth-token'] = token;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user); // Assuming your backend sends { user, profile }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      // If fetching user fails (e.g., token expired or invalid), log out
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken); // Update state, which triggers useEffect
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Failed to login');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken } = response.data; // Backend should return token on successful registration
      localStorage.setItem('token', newToken);
      setToken(newToken); // Update state, which triggers useEffect
      toast.success('Successfully registered!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Remove the header when logging out
    delete axios.defaults.headers.common['x-auth-token'];
    toast.success('Successfully logged out!');
  };

  const updateProfile = async (profileData) => {
    try {
      // Assuming /api/users/profile is where profile updates are handled
      // and it requires authentication.
      const response = await axios.put('/api/users/profile', profileData);
      // Assuming the response from updateProfile includes updated user/profile data
      setUser(response.data); 
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  // Show a loading spinner or null while auth is being checked
  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
      );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
