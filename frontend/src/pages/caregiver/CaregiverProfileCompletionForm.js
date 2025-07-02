import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CaregiverProfileCompletionForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/caregivers/profile', {
          headers: { 'x-auth-token': token }
        });

        console.log('Fetched caregiver profile:', res.data);
console.log('Bio:', res.data.bio);
console.log('Specialization Category:', res.data.specializationCategory);


        if (res.data && res.data.bio && res.data.specializationCategory && res.data.languagesSpoken?.length &&
  res.data.gender) {
          console.log('✅ Profile is complete. Redirecting...');
          navigate('/caregiver/dashboard');
        } else {
          console.warn('⚠️ Profile is missing fields. Staying on form.');
        }
      } catch (err) {
        console.error('Error checking caregiver profile:', err);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [token, navigate]);

  if (loading) return <div>Loading...</div>;

  const initialValues = {
    fullName: '',
    contactNumber: '',
    bio: '',
    experienceYears: '',
    specializationCategory: '',
    languagesSpoken: [],
    tribalLanguage: '',
    gender: '',
    culture: '',
    religion: ''
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
      window.location.href = '/caregiver/dashboard';
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

export default CaregiverProfileCompletionForm;
