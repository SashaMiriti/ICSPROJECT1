import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/auth';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['caregiver', 'care seeker'], 'Please select a valid role')
    .required('Role is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
});

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    const { confirmPassword, ...userData } = values;
    const success = await register(userData);
    if (success) {
      if (userData.role === 'caregiver') {
        navigate('/caregiver/dashboard');
      } else if (userData.role === 'care seeker') {
        navigate('/care-seeker/dashboard');
      } else {
        navigate('/');
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: '',
              phone: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.name && errors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {touched.name && errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.email && errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.phone && errors.phone ? 'border-red-500' : ''
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="form-label">
                    I want to...
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      required
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.role && errors.role ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select a role</option>
                      <option value="caregiver">Provide care services</option>
                      <option value="care seeker">Find care services</option>
                    </select>
                    {touched.role && errors.role && (
                      <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.password && errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    {touched.password && errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`input-field ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
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
                        Creating account...
                      </div>
                    ) : (
                      'Create account'
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