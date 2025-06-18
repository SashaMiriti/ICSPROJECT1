import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    serviceType: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement booking submission
    console.log('Booking submitted:', formData);
    navigate('/care-seeker/bookings');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Booking Details
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Please fill in the details for your booking request.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleSubmit}>
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        id="startTime"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={formData.startTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="endTime"
                        className="block text-sm font-medium text-gray-700"
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        id="endTime"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={formData.endTime}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="serviceType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Service Type
                      </label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={formData.serviceType}
                        onChange={handleChange}
                      >
                        <option value="">Select a service</option>
                        <option value="elderly">Elderly Care</option>
                        <option value="special">Special Needs Care</option>
                        <option value="child">Child Care</option>
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Any special requirements or information the caregiver should know..."
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Submit Booking
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 