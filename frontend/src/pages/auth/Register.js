import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast'; // Ensure toast is imported for messages

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
    const defaultPosition = [-1.286389, 36.817223]; // Default to Nairobi
    const position = (value && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number')
        ? [value[1], value[0]] // Leaflet expects [lat, lng]
        : defaultPosition;

    function LocationMarker() {
        useMapEvents({
            click(e) {
                onChange([e.latlng.lng, e.latlng.lat]); // Store as [lng, lat] for backend consistency
            },
        });
        return value && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number' ? (
            <Marker position={position} icon={markerIcon} />
        ) : null;
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
    username: Yup.string()
        .required('Username is required')
        .min(2, 'Username must be at least 2 characters'),
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
        .oneOf(['caregiver', 'careSeeker'], 'Please select a valid role')
        .required('Role is required'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    bio: Yup.string().when('role', {
        is: 'caregiver',
        then: (schema) => schema.required('Bio is required for caregivers.'),
        otherwise: (schema) => schema.notRequired(),
    }),
    locationAddress: Yup.string().when('role', {
        is: (role) => role === 'caregiver' || role === 'careSeeker',
        then: (schema) => schema.required('Location address is required.'),
        otherwise: (schema) => schema.notRequired(),
    }),
    locationCoordinates: Yup.array().when('role', {
        is: (role) => role === 'caregiver' || role === 'careSeeker',
        then: (schema) => schema.min(2, 'Please select a location on the map.').required('Location coordinates are required.'),
        otherwise: (schema) => schema.notRequired(),
    }).of(Yup.number('Coordinates must be numbers').required()),
});


export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (values, { setSubmitting }) => {
        // Prepare data to send to the backend
        const dataToSend = {
            username: values.username,
            email: values.email,
            password: values.password,
            role: values.role,
            phone: values.phone,
            bio: values.bio, // Always include, backend will ignore if not caregiver
            locationAddress: values.locationAddress, // Always include for backend validation
            locationCoordinates: values.locationCoordinates, // Always include for backend validation
        };

        // Call the register function from AuthContext
        const result = await register(dataToSend); // AuthContext.register returns { success, role }

        if (result.success) {
            // Navigate based on role received from AuthContext
            if (result.role === 'careSeeker') {
                navigate('/care-seeker/profile');
            } else if (result.role === 'caregiver') {
                navigate('/caregiver/profile'); // Or dashboard if preferred for caregivers
            } else {
                navigate('/'); // Fallback
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
                        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                            <Form className="space-y-6">
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="username" className="form-label">
                                        Username
                                    </label>
                                    <div className="mt-1">
                                        <Field
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            required
                                            className={`input-field ${
                                                touched.username && errors.username ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <ErrorMessage name="username" component="p" className="mt-2 text-sm text-red-600" />
                                    </div>
                                </div>

                                {/* Email Address */}
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

                                {/* Phone Number */}
                                <div>
                                    <label htmlFor="phone" className="form-label">
                                        Phone number
                                    </label>
                                    <div className="mt-1">
                                        <Field
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            className={`input-field ${
                                                touched.phone && errors.phone ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <ErrorMessage name="phone" component="p" className="mt-2 text-sm text-red-600" />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <label htmlFor="role" className="form-label">
                                        I want to...
                                    </label>
                                    <div className="mt-1">
                                        <Field
                                            as="select"
                                            id="role"
                                            name="role"
                                            required
                                            className={`input-field ${
                                                touched.role && errors.role ? 'border-red-500' : ''
                                            }`}
                                        >
                                            <option value="">Select a role</option>
                                            <option value="caregiver">Provide care services</option>
                                            <option value="careSeeker">Find care services</option>
                                        </Field>
                                        <ErrorMessage name="role" component="p" className="mt-2 text-sm text-red-600" />
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
                                                <Field
                                                    as="textarea"
                                                    id="bio"
                                                    name="bio"
                                                    rows="3"
                                                    className={`input-field ${
                                                        touched.bio && errors.bio ? 'border-red-500' : ''
                                                    }`}
                                                />
                                                <ErrorMessage name="bio" component="p" className="mt-2 text-sm text-red-600" />
                                            </div>
                                        </div>

                                        {/* Location Address (for caregiver) */}
                                        <div>
                                            <label htmlFor="locationAddress" className="form-label">
                                                Location Address
                                            </label>
                                            <div className="mt-1">
                                                <Field
                                                    id="locationAddress"
                                                    name="locationAddress"
                                                    type="text"
                                                    className={`input-field ${
                                                        touched.locationAddress && errors.locationAddress ? 'border-red-500' : ''
                                                    }`}
                                                />
                                                <ErrorMessage name="locationAddress" component="p" className="mt-2 text-sm text-red-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">Select caregiver location on the map</label>
                                            <LocationPicker
                                                value={values.locationCoordinates}
                                                onChange={(coords) => setFieldValue('locationCoordinates', coords)}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Click on the map to set location. Lat: {values.locationCoordinates[1] || 'N/A'}, Lng: {values.locationCoordinates[0] || 'N/A'}
                                            </p>
                                            <ErrorMessage name="locationCoordinates" component="p" className="mt-2 text-sm text-red-600" />
                                        </div>
                                    </>
                                )}

                                {/* Conditional Care Seeker Location Fields */}
                                {values.role === 'careSeeker' && (
                                    <>
                                        <div>
                                            <label htmlFor="locationAddress" className="form-label">
                                                Address
                                            </label>
                                            <div className="mt-1">
                                                <Field
                                                    id="locationAddress"
                                                    name="locationAddress"
                                                    type="text"
                                                    className={`input-field ${touched.locationAddress && errors.locationAddress ? 'border-red-500' : ''}`}
                                                />
                                                <ErrorMessage name="locationAddress" component="p" className="mt-2 text-sm text-red-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">Select your location on the map</label>
                                            <LocationPicker
                                                value={values.locationCoordinates}
                                                onChange={(coords) => setFieldValue('locationCoordinates', coords)}
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Click on the map to set your location. Lat: {values.locationCoordinates[1] || 'N/A'}, Lng: {values.locationCoordinates[0] || 'N/A'}
                                            </p>
                                            <ErrorMessage name="locationCoordinates" component="p" className="mt-2 text-sm text-red-600" />
                                        </div>
                                    </>
                                )}

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <Field
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className={`input-field ${
                                                touched.password && errors.password ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <ErrorMessage name="password" component="p" className="mt-2 text-sm text-red-600" />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirm password
                                    </label>
                                    <div className="mt-1">
                                        <Field
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className={`input-field ${
                                                touched.confirmPassword && errors.confirmPassword
                                                    ? 'border-red-500'
                                                    : ''
                                            }`}
                                        />
                                        <ErrorMessage name="confirmPassword" component="p" className="mt-2 text-sm text-red-600" />
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
