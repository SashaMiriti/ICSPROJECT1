import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function LocationPicker({ value, onChange }) {
  const defaultPosition = [-1.286389, 36.817223];
  const position = value && value.length === 2 ? [value[1], value[0]] : defaultPosition;

  function LocationMarker() {
    useMapEvents({
      click(e) {
        onChange([e.latlng.lng, e.latlng.lat]);
      }
    });
    return value ? <Marker position={position} icon={markerIcon} /> : null;
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: 250, width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

const validationSchema = Yup.object({
  username: Yup.string().required('Required').min(2),
  email: Yup.string().email('Invalid').required('Required'),
  password: Yup.string().required('Required').min(6),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
  role: Yup.string().oneOf(['caregiver', 'careSeeker']).required('Required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required(),
  bio: Yup.string().when('role', {
    is: 'caregiver',
    then: (schema) => schema.required('Bio is required')
  }),
  locationAddress: Yup.string().required('Required'),
  locationCoordinates: Yup.array().of(Yup.number()).min(2, 'Click on the map').required(),
});

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        formData.append(key, Array.isArray(val) ? JSON.stringify(val) : val);
      });

      if (values.role === 'caregiver' && documentFile) {
        formData.append('certification', documentFile);
      }

      const result = await register(formData, values.role);

      if (result.success) {
        toast.success('Registration successful!');
        navigate(result.role === 'caregiver'
          ? `/caregiver-confirmation?name=${encodeURIComponent(values.username)}`
          : '/care-seeker/profile'
        );
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full">
        <h2 className="text-center text-3xl font-bold">Create your account</h2>
        <p className="text-center text-sm text-gray-600 mt-2">
          Or{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            sign in
          </Link>
        </p>

        <Formik
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
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Basic Fields */}
              {['username', 'email', 'phone'].map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <Field
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    className={`w-full px-4 py-2 border ${errors[field] && touched[field] ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  <ErrorMessage name={field} component="p" className="text-sm text-red-600 mt-1" />
                </div>
              ))}

              {/* Passwords */}
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
                        className={`w-full px-4 py-2 border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm pr-10 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
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

              {/* Role Selector */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I want to...</label>
                <Field as="select" name="role" className="w-full px-4 py-2 border rounded-md shadow-sm">
                  <option value="">Select role</option>
                  <option value="caregiver">Provide care services</option>
                  <option value="careSeeker">Find care services</option>
                </Field>
                <ErrorMessage name="role" component="p" className="text-sm text-red-600 mt-1" />
              </div>

              {/* Caregiver-only Fields */}
              {values.role === 'caregiver' && (
                <>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <Field as="textarea" name="bio" rows={3} className="w-full px-4 py-2 border rounded-md shadow-sm" />
                    <ErrorMessage name="bio" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-1">Upload certification</label>
                    <input
                      id="certification"
                      name="certification"
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setDocumentFile(e.currentTarget.files[0])}
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Accepted: PDF, JPG, PNG</p>
                  </div>
                </>
              )}

              {/* Location Fields */}
              {(values.role === 'caregiver' || values.role === 'careSeeker') && (
                <>
                  <div>
                    <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
                    <Field name="locationAddress" className="w-full px-4 py-2 border rounded-md shadow-sm" />
                    <ErrorMessage name="locationAddress" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select location on map</label>
                    <LocationPicker
                      value={values.locationCoordinates}
                      onChange={(coords) => setFieldValue('locationCoordinates', coords)}
                    />
                    <ErrorMessage name="locationCoordinates" component="p" className="text-sm text-red-600 mt-1" />
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
