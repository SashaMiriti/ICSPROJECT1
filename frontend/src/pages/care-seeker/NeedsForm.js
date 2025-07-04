import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function NeedsForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    careType: '',
    location: '', // Can be shown but not used directly — used only for display or future map features
    schedule: '',
    specialNeeds: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        careType: formData.careType,
        schedule: formData.schedule,
        specialNeeds: formData.specialNeeds,

        // ⚠️ MOCKED coordinates for now (Nairobi)
       // locationCoordinates: [36.8219, -1.2921]
      };
      console.log("Request URL:", `${process.env.REACT_APP_API_URL}/match-caregivers`);


      const response = await axios.post(`${process.env.REACT_APP_API_URL}/match-caregivers`, payload);

       // ✅ Extract data from the response
      const matchedCaregivers = response.data;

      navigate('/care-seeker/search', { state: { matchedCaregivers } });


    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to match caregivers.'
      );
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Tell us about your care needs
      </h2>

      <div className="mb-4">
        <label htmlFor="careType" className="block text-lg font-medium text-gray-800 mb-2">
          Type of Care Needed
        </label>
        <select
          id="careType"
          name="careType"
          value={formData.careType}
          onChange={handleChange}
          required
          className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <option value="">Select...</option>
          <option value="elderly">Elderly Care</option>
          <option value="special">Special Needs</option>
          <option value="child">Child Care</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="location" className="block text-lg font-medium text-gray-800 mb-2">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full p-3 text-lg rounded border border-gray-300"
          placeholder="e.g. Nairobi"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="schedule" className="block text-lg font-medium text-gray-800 mb-2">
          Preferred Schedule
        </label>
        <input
          id="schedule"
          name="schedule"
          type="text"
          value={formData.schedule}
          onChange={handleChange}
          required
          className="w-full p-3 text-lg rounded border border-gray-300"
          placeholder="e.g. Weekdays, 9am-1pm"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="specialNeeds" className="block text-lg font-medium text-gray-800 mb-2">
          Special Needs or Requests
        </label>
        <textarea
          id="specialNeeds"
          name="specialNeeds"
          value={formData.specialNeeds}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 text-lg rounded border border-gray-300"
          placeholder="Describe any special requirements..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400 ${loading && 'opacity-50 cursor-not-allowed'}`}
      >
        {loading ? 'Submitting...' : 'Continue'}
      </button>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="w-full bg-gray-700 text-white text-xl font-bold py-4 rounded mt-4 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400"
      >
        Back to Dashboard
      </button>
    </form>
  );
}
