import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'; // <--- REMOVED THIS IMPORT

const AuthContext = createContext(null);

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
  // const navigate = useNavigate(); // <--- REMOVED THIS HOOK

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (storedToken) {
      setToken(storedToken);
      if (storedUsername && storedRole) {
        setUser({ username: storedUsername, role: storedRole });
        setLoading(false);
        fetchUser(storedToken);
      } else {
        fetchUser(storedToken);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (currentAuthToken) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'x-auth-token': currentAuthToken
        }
      });
      setUser(response.data);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);
    } catch (error) {
      console.error('Error fetching user:', error);
      // We no longer call logout() directly here to avoid navigate error,
      // the consuming component should check user status and navigate if needed.
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      setToken(null);
      setUser(null);
      toast.error('Session expired or invalid. Please log in again.');
      // The component calling useAuth will handle navigation to login page
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('role', userData.role);

      setToken(newToken);
      setUser(userData);
      toast.success('Logged in successfully');

      // <--- REMOVED NAVIGATION FROM HERE
      return { success: true, role: userData.role }; // Return success and role for navigation in component
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token: newToken, user: newUserData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('username', newUserData.username);
      localStorage.setItem('role', newUserData.role);

      setToken(newToken);
      setUser(newUserData);
      toast.success('Registered successfully');

      // <--- REMOVED NAVIGATION FROM HERE
      return { success: true, role: newUserData.role }; // Return success and role for navigation in component
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    // <--- REMOVED NAVIGATION FROM HERE
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        profileData,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      setUser(prev => ({ ...prev, ...response.data.user }));
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
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
    token,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
