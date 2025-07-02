import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/',
  timeout: 8000,
});

// Optional: attach interceptor for global error handling (e.g. auto logout on 401)
// API.interceptors.response.use(null, error => {
//   if (error.response?.status === 401) {
//     localStorage.clear();
//     window.location.href = '/login';
//   }
//   return Promise.reject(error);
// });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Automatically fetch user on app load if token exists
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get('/auth/me', {
        headers: { 'x-auth-token': token },
      });
      let userData = res.data;
      // If caregiver, fetch caregiver profile for profileComplete
      if (userData.role === 'caregiver') {
        try {
          const caregiverRes = await API.get('/caregivers/profile', {
            headers: { 'x-auth-token': token },
          });
          userData = { ...userData, profileComplete: caregiverRes.data.profileComplete };
        } catch (e) {
          console.error('Error fetching caregiver profile for profileComplete:', e);
        }
      }
      setUser(userData);
      setUserRole(userData.role);
    } catch (error) {
      console.error('Error fetching user on startup:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password, role });
      const { token, user } = res.data;
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);
      // If caregiver, fetch caregiver profile for profileComplete
      let userData = user;
      if (user.role === 'caregiver') {
        try {
          const caregiverRes = await API.get('/caregivers/profile', {
            headers: { 'x-auth-token': token },
          });
          userData = { ...user, profileComplete: caregiverRes.data.profileComplete };
        } catch (e) {
          console.error('Error fetching caregiver profile for profileComplete:', e);
        }
      }
      setToken(token);
      setUser(userData);
      setUserRole(userData.role);
      return { success: true, role: user.role };
    } catch (err) {
      const message = err.response?.data?.message;
      // Handle unapproved caregiver redirection
      if (
        role === 'caregiver' &&
        err.response?.data?.message === 'Caregiver not yet approved by admin' &&
        err.response?.data?.user?.username
      ) {
        const unapprovedName = encodeURIComponent(err.response.data.user.username);
        return { success: false, redirectTo: `/caregiver-confirmation?name=${unapprovedName}` };
      }
      console.error('Login error:', err.response?.data || err.message);
      toast.error(message || 'Login failed');
      return { success: false, message: message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const headers = userData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : {};
      const res = await API.post('/auth/register', userData, { headers });
      const { user: newUser, token: newToken } = res.data;
      if (newUser.role === 'careSeeker') {
        // Auto-login care seekers
        localStorage.setItem('token', newToken);
        localStorage.setItem('username', newUser.username);
        localStorage.setItem('role', newUser.role);
        setToken(newToken);
        setUser(newUser);
        setUserRole(newUser.role);
        toast.success('Registered successfully');
        return { success: true, role: newUser.role };
      } else {
        toast.success('Application submitted. Wait for admin approval.');
        return { success: true, role: newUser.role };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      console.error('Registration error:', err);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken('');
    setUser(null);
    setUserRole(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await API.put('/users/profile', profileData, {
        headers: { 'x-auth-token': token },
      });
      const updatedUser = res.data.user;
      setUser((prev) => ({ ...prev, ...updatedUser }));
      if (updatedUser.username) {
        localStorage.setItem('username', updatedUser.username);
      }
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const isAuthenticated = !!(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        fetchUser,
        setUser,
        setUserRole,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
