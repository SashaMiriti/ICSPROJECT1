// src/pages/auth/Register.js

// Import necessary React hooks and components from libraries
import React, { useState } from 'react'; // useState for managing component state
import { Link, useNavigate } from 'react-router-dom'; // Link for navigation, useNavigate for programmatic navigation
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Formik for form management (state, validation, submission)
import * as Yup from 'yup'; // Yup for schema-based form validation
import { useAuth } from '../../contexts/AuthContext'; // Custom hook to access authentication context (e.g., register function)
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'; // React-Leaflet components for interactive maps
import 'leaflet/dist/leaflet.css'; // Leaflet's core CSS for map styling
import L from 'leaflet'; // Leaflet library for map functionalities
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Icons for toggling password visibility
import toast from 'react-hot-toast';

// Define a custom marker icon for the Leaflet map
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', // URL for the default Leaflet marker image
  iconSize: [25, 41], // Size of the icon [width, height]
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', // URL for the marker's shadow image
  shadowSize: [41, 41], // Size of the shadow
});

/**
 * LocationPicker Component
 * Renders an interactive Leaflet map allowing users to select a location.
 * The selected location's coordinates (longitude, latitude) are passed via onChange.
 * @param {object} props - Component props
 * @param {array} props.value - Current selected coordinates [lng, lat]
 * @param {function} props.onChange - Callback function to update coordinates in parent form
 */
function LocationPicker({ value, onChange }) {
  // Default position for the map (Nairobi coordinates)
  const defaultPosition = [-1.286389, 36.817223];
  // Determine the map center: use current value if available, otherwise use default
  // Note: Leaflet expects [lat, lng], but our internal format is [lng, lat], so we swap them.
  const position = value?.length === 2 ? [value[1], value[0]] : defaultPosition;

  /**
   * LocationMarker Component (Inner component for handling map events)
   * This component uses the useMapEvents hook to listen for clicks on the map.
   * When a click occurs, it updates the coordinates via the onChange prop.
   */
  function LocationMarker() {
    // Hook to access map events
    useMapEvents({
      // Event listener for map clicks
      click(e) {
        // Update the form field with the new coordinates [longitude, latitude]
        onChange([e.latlng.lng, e.latlng.lat]);
      },
    });
    // Render a marker at the selected position if value exists, otherwise render nothing
    return value ? <Marker position={position} icon={markerIcon} /> : null;
  }

  return (
    // MapContainer: The main container for the Leaflet map
    <MapContainer
      center={position} // Initial center of the map
      zoom={13} // Initial zoom level
      style={{ height: 250, width: '100%', borderRadius: '8px' }} // Inline styles for appearance
    >
      {/* TileLayer: Renders the map tiles from OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors' // Required attribution
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // URL template for OpenStreetMap tiles
      />
      {/* LocationMarker: Component that handles map clicks and displays the marker */}
      <LocationMarker />
    </MapContainer>
  );
}

// Yup validation schema for the registration form fields
const validationSchema = Yup.object({
  username: Yup.string().required('Required').min(2, 'Username too short'), // Username must be a string, required, and at least 2 characters
  email: Yup.string().email('Invalid email address').required('Required'), // Email must be a valid email format and required
  password: Yup.string().required('Required').min(6, 'Password must be at least 6 characters'), // Password required and min 6 characters
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match') // Must match the password field
    .required('Required'), // Confirmation password is required
  role: Yup.string()
    .oneOf(['caregiver', 'careSeeker'], 'Invalid role selected') // Role must be either 'caregiver' or 'careSeeker'
    .required('Required'), // Role is required
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits') // Phone must be exactly 10 digits
    .required('Required'), // Phone number is required
  bio: Yup.string().when('role', {
    // Bio field is conditionally required based on role
    is: 'caregiver', // If role is 'caregiver'
    then: (schema) => schema.required('Bio is required for caregivers'), // Then bio is required
  }),
  locationAddress: Yup.string().required('Required'),
  locationCoordinates: Yup.array().of(Yup.number()).min(2, 'Click on the map').required(),
  specializationCategory: Yup.string().when('role', {
    is: 'caregiver',
    then: (schema) =>
      schema
        .oneOf(['Elderly Care', 'People with Disabilities', 'Both'], 'Select a valid category')
        .required('Specialization category is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

/**
 * Register Component
 * This is the main component for the user registration page.
 * It handles form rendering, validation, state management, and submission.
 */
export default function Register() {
  // Hook to programmatically navigate users to different routes
  const navigate = useNavigate();
  // Destructure the 'register' function from the authentication context
  const { register } = useAuth();

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [formError, setFormError] = useState('');

  /**
   * handleSubmit function
   * This asynchronous function is called when the Formik form is submitted.
   * It handles data preparation, API call, and redirection/error display.
   * @param {object} values - Form field values from Formik
   * @param {object} formikBag - Formik's helper object, includes setSubmitting
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    setFormError('');
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        formData.append(key, Array.isArray(val) ? JSON.stringify(val) : val);
      });
      if (values.role === 'caregiver' && documentFiles && documentFiles.length > 0) {
        Array.from(documentFiles).forEach(file => {
          formData.append('certifications', file);
        });
      }
      const result = await register(formData, values.role);
      if (result.success) {
        if (result.role === 'caregiver') {
          if (result.profileComplete && result.isVerified) {
            navigate('/caregiver/dashboard');
          } else {
            navigate(`/caregiver-confirmation?name=${encodeURIComponent(values.username)}`);
          }
        } else {
          navigate('/care-seeker/profile');
        }
      } else {
        setFormError(result.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.message || 'An error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Main container for the registration form, styled with Tailwind CSS for responsiveness and centering
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full">
        {/* Page Title */}
        <h2 className="text-center text-3xl font-bold">Create your account</h2>
        {/* Subtitle with link to login page */}
        <p className="text-center text-sm text-gray-600 mt-2">
          Or{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            sign in
          </Link>
        </p>

        {/* Formik Wrapper: Manages form state, validation, and submission */}
        <Formik
          // Initial values for all form fields
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            phone: '',
            bio: '',
            locationAddress: '',
            locationCoordinates: [],
            specializationCategory: '',
          }}
          validationSchema={validationSchema} // Apply the Yup validation schema defined above
          onSubmit={handleSubmit} // Call the handleSubmit function on form submission
        >
          {/* Render Prop: Provides Formik's state and helpers */}
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {['username', 'email', 'phone'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <Field
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    className={`w-full px-4 py-2 border ${errors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  {/* Display error message if field has an error and has been touched */}
                  <ErrorMessage name={field} component="p" className="text-sm text-red-600 mt-1" />
                </div>
              ))}

              {[{ name: 'password', show: showPassword, setShow: setShowPassword },
              { name: 'confirmPassword', show: showConfirmPassword, setShow: setShowConfirmPassword }]
                .map(({ name, show, setShow }) => (
                  <div key={name}>
                    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                      {name === 'password' ? 'Password' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Field
                        id={name}
                        name={name}
                        type={show ? 'text' : 'password'}
                        className={`w-full px-4 py-2 border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    <ErrorMessage name={name} component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                ))}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I want to...
                </label>
                {/* Field for role selection, rendered as a <select> element */}
                <Field as="select" name="role" className="w-full px-4 py-2 border rounded-md shadow-sm">
                  <option value="">Select role</option>
                  <option value="caregiver">Provide care services</option>
                  <option value="careSeeker">Find care services</option>
                </Field>
                <ErrorMessage name="role" component="p" className="text-sm text-red-600 mt-1" />
              </div>

              {values.role === 'caregiver' && (
                <>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {/* Textarea for caregiver's bio */}
                    <Field as="textarea" name="bio" rows={3} className="w-full px-4 py-2 border rounded-md shadow-sm" />
                    <ErrorMessage name="bio" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                  <div>
                    <label htmlFor="specializationCategory" className="block text-sm font-medium text-gray-700 mb-1">Specialization Category</label>
                    <Field as="select" name="specializationCategory" className="w-full px-4 py-2 border rounded-md shadow-sm">
                      <option value="" disabled>Select category</option>
                      <option value="Elderly Care">Elderly Care</option>
                      <option value="People with Disabilities">People with Disabilities</option>
                      <option value="Both">Both</option>
                    </Field>
                    <ErrorMessage name="specializationCategory" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">Upload certifications</label>
                    <input
                      id="certification"
                      name="certifications"
                      type="file"
                      accept=".pdf,.jpg,.png"
                      multiple
                      onChange={(e) => setDocumentFiles(e.currentTarget.files)}
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepted: PDF, JPG, PNG. You can select multiple files.</p>
                  </div>
                </>
              )}

              {(values.role === 'caregiver' || values.role === 'careSeeker') && (
                <>
                  <div>
                    <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Location Address
                    </label>
                    <Field name="locationAddress" className="w-full px-4 py-2 border rounded-md shadow-sm" />
                    <ErrorMessage name="locationAddress" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select location on map
                    </label>
                    {/* LocationPicker component for map interaction */}
                    <LocationPicker
                      value={values.locationCoordinates} // Pass current coordinates from Formik state
                      onChange={(coords) => setFieldValue('locationCoordinates', coords)} // Update Formik state on map click
                    />
                    <ErrorMessage name="locationCoordinates" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                </>
              )}

              {/* Display Backend Error Message (if any) */}
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                  {formError}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting} // Disable button while form is submitting
                  className="w-full py-2 px-4 bg-green-600 text-white font-bold rounded-md hover:bg-green-700"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'} {/* Change text based on submitting state */}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
