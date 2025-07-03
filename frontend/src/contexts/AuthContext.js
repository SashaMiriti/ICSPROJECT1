import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // ✅ useEffect added here
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

    // ✅ Automatically fetch user on app load if token exists
  const fetchUser = useCallback(async () => {
    try {
      console.log('📡 Fetching user from /auth/me...');
      const res = await API.get('/auth/me', {
        headers: { 'x-auth-token': token },
      });
      let userData = res.data;
      console.log('✅ User data fetched:', userData);
      
      // If caregiver, fetch caregiver profile for profileComplete
      if (userData.role === 'caregiver') {
        try {
          console.log('📡 Fetching caregiver profile...');
          const caregiverRes = await API.get('/caregivers/profile', {
            headers: { 'x-auth-token': token },
          });
          userData = { ...userData, profileComplete: caregiverRes.data.profileComplete };
          console.log('✅ Caregiver profile fetched, profileComplete:', caregiverRes.data.profileComplete);
        } catch (e) {
          console.error('❌ Error fetching caregiver profile for profileComplete:', e);
        }
      }
      setUser(userData);
      setUserRole(userData.role);
    } catch (error) {
      console.error('❌ Error fetching user on startup:', error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token && !user) {
      console.log('🔄 Fetching user on app load...');
      fetchUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Debug user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', { user, userRole, token });
  }, [user, userRole, token]);


  const login = async (email, password, role) => {
    if (loading) {
      console.log('🛑 Login already in progress, skipping...');
      return { success: false, message: 'Login already in progress' };
    }
    
    setLoading(true);
    try {
      console.log('🔐 Starting login process for:', email, 'role:', role);
      const res = await API.post('/auth/login', { email, password, role });
      const { token, user } = res.data;
      console.log('✅ Login API call successful, user:', user);

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);

      setToken(token);
      let userData = user;
      // If caregiver, fetch caregiver profile for profileComplete
      if (user.role === 'caregiver') {
        try {
          console.log('📡 Fetching caregiver profile for profileComplete...');
          const caregiverRes = await API.get('/caregivers/profile', {
            headers: { 'x-auth-token': token },
          });
          userData = { ...user, profileComplete: caregiverRes.data.profileComplete };
          console.log('✅ Caregiver profile fetched, profileComplete:', caregiverRes.data.profileComplete);
        } catch (e) {
          console.error('❌ Error fetching caregiver profile for profileComplete:', e);
          // Don't fail the login if profile fetch fails
          userData = { ...user, profileComplete: false };
        }
      }
      console.log('👤 Setting user data:', userData);
      setUser(userData);
      setUserRole(userData.role);
      console.log('✅ User state updated, userRole:', userData.role);

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
        // For caregivers, return profileComplete and isVerified
        toast.success('Application submitted. Wait for admin approval.');
        return {
          success: true,
          role: newUser.role,
          profileComplete: newUser.profileComplete,
          isVerified: newUser.isVerified
        };
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
      if (updatedUser.role) {
        localStorage.setItem('role', updatedUser.role);
        setUserRole(updatedUser.role);
      }

      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      console.error('Profile update error:', err);
      toast.error(message);
      return false;
    }
  };


  const isAuthenticated = !!(user && token);

  
  console.log('🔐 AuthContext provider value:', { user, userRole, token, isAuthenticated });
  

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        fetchUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
