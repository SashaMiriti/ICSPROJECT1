import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: Yup.string().oneOf(['careSeeker', 'caregiver', 'admin'], 'Invalid role').required('Role is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    console.log('🚀 Login form submitted with values:', values);
    const result = await login(values.email, values.password, values.role);
    console.log('📋 Login result:', result);

    if (result.success) {
      console.log('✅ Login successful, navigating to dashboard...');
      toast.success('Login successful!');
      switch (result.role) {
        case 'careSeeker':
          console.log('🎯 Navigating to care seeker dashboard');
          navigate('/care-seeker/dashboard');
          break;
        case 'caregiver':
          console.log('🎯 Navigating to caregiver dashboard');
          navigate('/caregiver/dashboard');
          break;
        case 'admin':
          console.log('🎯 Navigating to admin dashboard');
          navigate('/admin/dashboard');
          break;
        default:
          console.log('🎯 Navigating to home');
          navigate('/');
      }
    } else if (result.redirectTo) {
      // 👇 Unapproved caregiver: show toast + redirect
      console.log('🔄 Redirecting unapproved caregiver to:', result.redirectTo);
      toast.error('You have not yet been approved by admin.');
      navigate(result.redirectTo);
    } else {
      console.log('❌ Login failed:', result.message);
      toast.error(result.message || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('💥 Login component caught error:', error);
    toast.error(error.message || 'An unexpected error occurred during login.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>

        <Formik
          initialValues={{ email: '', password: '', role: 'careSeeker' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="email" component="p" className="text-sm text-red-600 mt-1" />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={`block w-full px-4 py-2 border rounded-md shadow-sm pr-10 focus:outline-none sm:text-sm ${
                      touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="text-sm text-red-600 mt-1" />
              </div>

              {/* Role Dropdown */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I am a:
                </label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  required
                  className={`block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm sm:text-sm ${
                    touched.role && errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select role</option>
                  <option value="careSeeker">Care Seeker</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="admin">Admin</option>
                </Field>
                <ErrorMessage name="role" component="p" className="text-sm text-red-600 mt-1" />
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
