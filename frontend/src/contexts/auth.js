import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Set global base URL for Axios
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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set or clear token in Axios headers
  const applyToken = (jwt) => {
    if (jwt) {
      axios.defaults.headers.common['x-auth-token'] = jwt;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (err) {
      console.error('Error fetching user:', err.response?.data || err.message);
      logout(); // Clean up if token is invalid
    } finally {
      setLoading(false);
    }
  };

  // On token change, set headers and get user
  useEffect(() => {
    if (token) {
      applyToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      applyToken(newToken);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to login');
      return false;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      applyToken(newToken);
      toast.success('Successfully registered!');
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to register');
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    applyToken(null);
    toast.success('Successfully logged out!');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
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
