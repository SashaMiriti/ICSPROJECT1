import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CaregiverProfileCompletionForm = () => {
  const { token, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);
  const [error, setError] = useState(null);
  const hasAttemptedRedirect = useRef(false);

  console.log('🔍 CaregiverProfileCompletionForm rendering:', { loading, hasAttemptedRedirect: hasAttemptedRedirect.current, existingProfile, error });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        console.log('🔄 Starting profile check...');
        console.log('🔑 Token exists:', !!token);
        
        if (!token) {
          console.error('❌ No token available');
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        // Prevent multiple simultaneous API calls
        if (hasAttemptedRedirect.current) {
          console.log('🛑 Already attempted redirect, skipping check');
          return;
        }

        // Check if we're already on the dashboard (shouldn't happen but just in case)
        if (window.location.pathname === '/caregiver/dashboard') {
          console.log('🛑 Already on dashboard, skipping check');
          return;
        }

        console.log('📡 Making API call to /api/caregivers/profile');
        const res = await axios.get('http://localhost:5000/api/caregivers/profile', {
          headers: { 'x-auth-token': token }
        });

        console.log('✅ API call successful');
        console.log('📊 Response status:', res.status);
        console.log('Fetched caregiver profile:', res.data);
        console.log('Bio:', res.data.bio);
        console.log('Specialization Category:', res.data.specializationCategory);

        // Store the existing profile data
        setExistingProfile(res.data);

        // Check if profile is complete based on all required fields
        const isComplete = res.data && 
          res.data.bio && 
          res.data.specializationCategory && 
          res.data.languagesSpoken?.length > 0 &&
          res.data.gender &&
          res.data.culture &&
          res.data.religion &&
          res.data.experienceYears !== undefined &&
          res.data.experienceYears !== null;

        console.log('📊 Profile completion check:', { isComplete, hasAttemptedRedirect: hasAttemptedRedirect.current });

        if (isComplete && !hasAttemptedRedirect.current) {
          console.log('✅ Profile is complete. Redirecting...');
          hasAttemptedRedirect.current = true;
          
          // Update the user context to reflect that profile is complete
          const updatedUser = { ...user, profileComplete: true };
          setUser(updatedUser);
          
          // Use navigate instead of window.location.href for better React Router integration
          navigate('/caregiver/dashboard', { replace: true });
        } else if (!isComplete) {
          console.warn('⚠️ Profile is missing fields. Staying on form.');
          console.log('Missing fields:', {
            bio: !!res.data?.bio,
            specializationCategory: !!res.data?.specializationCategory,
            languagesSpoken: res.data?.languagesSpoken?.length > 0,
            gender: !!res.data?.gender,
            culture: !!res.data?.culture,
            religion: !!res.data?.religion,
            experienceYears: res.data?.experienceYears !== undefined && res.data?.experienceYears !== null
          });
        }
      } catch (err) {
        console.error('❌ Error checking caregiver profile:', err);
        console.error('❌ Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.message || 'Failed to load profile');
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout reached, forcing loading to false');
      setLoading(false);
      setError('Profile check timed out. Please refresh the page.');
    }, 10000); // 10 second timeout

    checkProfile();

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, user, setUser]);

  console.log('🎯 About to render, loading:', loading);

  if (loading) {
    console.log('⏳ Showing loading...');
    return (
      <div className="text-center mt-10">
        <div className="text-lg">Loading your profile...</div>
        <div className="text-sm text-gray-500 mt-2">This may take a few seconds</div>
      </div>
    );
  }

  if (error) {
    console.log('❌ Showing error:', error);
    return (
      <div className="text-center mt-10">
        <div className="text-red-600 text-lg">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  console.log('📝 Rendering form with existingProfile:', existingProfile);

  const initialValues = {
    fullName: existingProfile?.fullName || '',
    contactNumber: existingProfile?.contactNumber || '',
    bio: existingProfile?.bio || '',
    experienceYears: existingProfile?.experienceYears || '',
    specializationCategory: existingProfile?.specializationCategory || '',
    languagesSpoken: existingProfile?.languagesSpoken || [],
    tribalLanguage: existingProfile?.tribalLanguage || '',
    gender: existingProfile?.gender || '',
    culture: existingProfile?.culture || '',
    religion: existingProfile?.religion || ''
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Required'),
    contactNumber: Yup.string().required('Required'),
    bio: Yup.string().required('Required'),
    experienceYears: Yup.number().min(0).required('Required'),
    specializationCategory: Yup.string().required('Required'),
    languagesSpoken: Yup.array().min(1, 'Select at least one'),
    tribalLanguage: Yup.string().test(
      'required-if-tribal',
      'Select your tribal language',
      function (value) {
        const { languagesSpoken } = this.parent;
        if (languagesSpoken.includes('Tribal')) {
          return !!value;
        }
        return true;
      }
    ),
    gender: Yup.string().required('Required'),
    culture: Yup.string().required('Required'),
    religion: Yup.string().required('Required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log('Submitting profile values:', values);

    try {
      const profileRes = await axios.get('http://localhost:5000/api/caregivers/profile', {
  headers: { 'x-auth-token': token }
});
const caregiverId = profileRes.data._id;

const response = await axios.put(
  `http://localhost:5000/api/caregivers/${caregiverId}`,
  values,
  {
    headers: { 'x-auth-token': token }
  }
);

      // Optionally update user context/profileComplete here if needed
      console.log('Server response:', response.data);
      // Use navigate for better React Router integration
      navigate('/caregiver/dashboard', { replace: true });
    } catch (err) {
      console.error('Error saving profile:', err.response?.data || err.message || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">Complete Your Profile</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1">Full Name</label>
              <Field name="fullName" className="w-full border p-2 rounded" />
              <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Contact Number</label>
              <Field name="contactNumber" className="w-full border p-2 rounded" />
              <ErrorMessage name="contactNumber" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Short Bio</label>
              <Field as="textarea" name="bio" className="w-full border p-2 rounded" />
              <ErrorMessage name="bio" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Years of Experience</label>
              <Field name="experienceYears" type="number" className="w-full border p-2 rounded" />
              <ErrorMessage name="experienceYears" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Specialization</label>
              <Field as="select" name="specializationCategory" className="w-full border p-2 rounded">
                <option value="" disabled hidden>-- Choose Specialization --</option>
                <option value="Elderly Care">Elderly Care</option>
                <option value="People with Disabilities">People with Disabilities</option>
                <option value="Both">Both</option>
              </Field>
              <ErrorMessage name="specializationCategory" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Languages Spoken</label>
              {['English', 'Kiswahili', 'Tribal'].map((lang) => (
                <label key={lang} className="mr-4">
                  <Field
                    type="checkbox"
                    name="languagesSpoken"
                    value={lang}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const updated = checked
                        ? [...values.languagesSpoken, lang]
                        : values.languagesSpoken.filter((l) => l !== lang);
                      setFieldValue('languagesSpoken', updated);
                    }}
                  />
                  <span className="ml-1">{lang}</span>
                </label>
              ))}
              <ErrorMessage name="languagesSpoken" component="div" className="text-red-500 text-sm" />
            </div>

            {values.languagesSpoken.includes('Tribal') && (
              <div>
                <label className="block mb-1">Specify Tribal Language</label>
                <Field
                  name="tribalLanguage"
                  placeholder="e.g. Kikuyu, Kisii, etc."
                  className="w-full border p-2 rounded"
                />
                <ErrorMessage name="tribalLanguage" component="div" className="text-red-500 text-sm" />
              </div>
            )}

            <div>
              <label className="block mb-1">Gender</label>
              <Field as="select" name="gender" className="w-full border p-2 rounded">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Culture</label>
              <Field name="culture" className="w-full border p-2 rounded" />
              <ErrorMessage name="culture" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block mb-1">Religion</label>
              <Field name="religion" className="w-full border p-2 rounded" />
              <ErrorMessage name="religion" component="div" className="text-red-500 text-sm" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Profile
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

// Add a fallback export in case of issues
export default CaregiverProfileCompletionForm;
