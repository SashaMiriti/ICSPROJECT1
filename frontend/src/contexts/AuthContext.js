import React, { createContext, useContext, useState, useEffect } from 'react'; // ✅ useEffect added here
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // ✅ Automatically fetch user on app load if token exists
  const fetchUser = async () => {
  try {
    const res = await API.get('/auth/me', {
      headers: { 'x-auth-token': token },
    });
    setUser(res.data);
    setUserRole(res.data.role);
  } catch (error) {
    console.error('Error fetching user on startup:', error);
  }
};

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

      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);

      setToken(token);
      setUser(user);
      setUserRole(user.role);

      return { success: true, role: user.role };
    } catch (err) {
      const message = err.response?.data?.message;

      // ✅ Handle unapproved caregiver redirection
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
      let payload = userData;
      let headers = {};

      if (userData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await API.post('/auth/register', payload, { headers });
      const { user: newUserData } = response.data;

      if (newUserData.role === 'careSeeker') {
        const token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', newUserData.username);
        localStorage.setItem('role', newUserData.role);

        setToken(token);
        setUser(newUserData);
        setUserRole(newUserData.role);

        toast.success('Registered successfully');
        return { success: true, role: newUserData.role };
      } else {
        toast.success('Application submitted. Wait for admin approval.');
        return { success: true, role: newUserData.role };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
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
      const response = await API.put('/users/profile', profileData, {
        headers: {
          'x-auth-token': token,
        },
      });

      setUser((prev) => ({ ...prev, ...response.data.user }));
      if (response.data.user.username) {
        localStorage.setItem('username', response.data.user.username);
      }
      if (response.data.user.role) {
        localStorage.setItem('role', response.data.user.role);
        setUserRole(response.data.user.role);
      }

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
    userRole,
    loading,
    login,
    register,
    logout,
    updateProfile,
    token,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
