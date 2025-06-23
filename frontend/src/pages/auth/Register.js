import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/auth';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  // New conditional validations for caregiver fields
  bio: Yup.string().when('role', {
    is: 'caregiver',
    then: (schema) => schema.required('Bio is required for caregivers.'),
    otherwise: (schema) => schema.notRequired(),
  }),
  locationAddress: Yup.string().when('role', {
    is: 'caregiver',
    then: (schema) => schema.required('Location address is required for caregivers.'),
    otherwise: (schema) => schema.notRequired(),
  }),
  // For coordinates, we'll send a placeholder or derive from address later.
  // For now, we'll ensure the object structure is sent.
});

// Fix marker icon issue with Leaflet in React
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function LocationPicker({ value, onChange }) {
  // value: [lng, lat]
  const position = value && value.length === 2 ? [value[1], value[0]] : [51.505, -0.09]; // Default: London
  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange([e.latlng.lng, e.latlng.lat]);
      },
    });
    return value && value.length === 2 ? (
      <Marker position={position} icon={markerIcon} />
    ) : null;
  }
  return (
    <MapContainer center={position} zoom={13} style={{ height: 250, width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    // Destructure out confirmPassword as it's not sent to the backend
    const { confirmPassword, ...userData } = values;

    if (userData.role === 'caregiver') {
      userData.location = {
        address: userData.locationAddress,
        coordinates: userData.locationCoordinates,
      };
      // Bio is already directly in userData via Formik values
    } else if (userData.role === 'care seeker') {
      // For care seekers, send locationAddress and locationCoordinates as top-level fields
      // so the backend can use them to build the location object
      // (do not delete them)
      // Remove caregiver-only fields
      delete userData.bio;
    }
    // Remove fields not needed by backend
    delete userData.confirmPassword;

    const success = await register(userData);
    if (success) {
      if (userData.role === 'caregiver') {
        navigate('/caregiver/dashboard');
      } else if (userData.role === 'care seeker') {
        navigate('/care-seeker/dashboard');
      } else {
        navigate('/'); // Fallback if role is unexpectedly not set
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
              bio: '',
              locationAddress: '',
              locationCoordinates: [0, 0],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Full Name */}
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

                {/* Email Address */}
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

                {/* Phone Number */}
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

                {/* Role Selection */}
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

                {/* Conditional Caregiver Fields */}
                {values.role === 'caregiver' && (
                  <>
                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="form-label">
                        Bio (Tell us about yourself)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          name="bio"
                          value={values.bio}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows="3"
                          className={`input-field ${
                            touched.bio && errors.bio ? 'border-red-500' : ''
                          }`}
                        ></textarea>
                        {touched.bio && errors.bio && (
                          <p className="mt-2 text-sm text-red-600">{errors.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Location Address */}
                    <div>
                      <label htmlFor="locationAddress" className="form-label">
                        Location Address
                      </label>
                      <div className="mt-1">
                        <input
                          id="locationAddress"
                          name="locationAddress"
                          type="text"
                          value={values.locationAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input-field ${
                            touched.locationAddress && errors.locationAddress ? 'border-red-500' : ''
                          }`}
                        />
                        {touched.locationAddress && errors.locationAddress && (
                          <p className="mt-2 text-sm text-red-600">{errors.locationAddress}</p>
                        )}
                      </div>
                    </div>
                    {/* Note: locationCoordinates are being hardcoded for now,
                         but in a real app, you'd use a geolocation service
                         to get them from the address or direct user input. */}
                  </>
                )}

                {/* Care Seeker Location Fields */}
                {values.role === 'care seeker' && (
                  <>
                    <div>
                      <label htmlFor="locationAddress" className="form-label">
                        Address
                      </label>
                      <div className="mt-1">
                        <input
                          id="locationAddress"
                          name="locationAddress"
                          type="text"
                          value={values.locationAddress}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`input-field ${touched.locationAddress && errors.locationAddress ? 'border-red-500' : ''}`}
                        />
                        {touched.locationAddress && errors.locationAddress && (
                          <p className="mt-2 text-sm text-red-600">{errors.locationAddress}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Select your location on the map</label>
                      <LocationPicker
                        value={values.locationCoordinates}
                        onChange={(coords) => setFieldValue('locationCoordinates', coords)}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Click on the map to set your location. Coordinates: {values.locationCoordinates[1]}, {values.locationCoordinates[0]}
                      </p>
                    </div>
                  </>
                )}

                {/* Password */}
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

                {/* Confirm Password */}
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

                {/* Submit Button */}
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
