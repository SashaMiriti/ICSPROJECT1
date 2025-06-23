import React, { useState } from 'react'; // Ensure useState is imported
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Assuming Formik is used here too
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext'; // Correct path to AuthContext
import toast from 'react-hot-toast'; // Assuming you use toast

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  // Ensure 'login' is destructured from useAuth().
  // If you also need 'user' directly in this component, you would destructure it too:
  // const { login, user } = useAuth();
  const { login } = useAuth(); // You only need 'login' function for submitting the form

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await login(values.email, values.password); // AuthContext.login now returns { success, role }

      if (result.success) {
        // Navigate based on role received from AuthContext
        if (result.role === 'careSeeker') {
          navigate('/care-seeker/profile'); // Or '/care-seeker/dashboard'
        } else if (result.role === 'caregiver') {
          navigate('/caregiver/profile'); // Or '/caregiver/dashboard'
        } else {
          navigate('/'); // Fallback
        }
      } else {
        // Error message handled by toast in AuthContext, but you can add more specific handling here if needed
      }
    } catch (error) {
      // This catch block would handle errors re-thrown by AuthContext.login
      console.error("Login component caught error:", error);
      // toast.error(error.message || 'An unexpected error occurred during login.'); // Toast already handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`input-field ${
                        touched.email && errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    <ErrorMessage name="email" component="p" className="mt-2 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="mt-1">
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`input-field ${
                        touched.password && errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <ErrorMessage name="password" component="p" className="mt-2 text-sm text-red-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {/* Remember Me Checkbox (if applicable) */}
                    {/* <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label> */}
                  </div>

                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
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
    </div>
  );
}
