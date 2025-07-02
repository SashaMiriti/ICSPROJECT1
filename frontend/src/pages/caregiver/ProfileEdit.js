import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileEdit() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    hourlyRate: '',
    services: [],
    certifications: '',
    availability: {
      monday: { start: '', end: '' },
      tuesday: { start: '', end: '' },
      wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' },
      friday: { start: '', end: '' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' },
    },
  });

  const serviceOptions = [
    'Elderly Care',
    'Special Needs Care',
    'Child Care',
    'Medication Management',
    'Physical Therapy',
    'Companionship',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log('Profile update:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Profile Information
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Update your profile information to help care seekers find you.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Tell care seekers about yourself..."
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="hourlyRate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        id="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Services Offered
                    </label>
                    <div className="mt-2 space-y-2">
                      {serviceOptions.map((service) => (
                        <div key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label
                      htmlFor="certifications"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Certifications
                    </label>
                    <textarea
                      id="certifications"
                      name="certifications"
                      rows={3}
                      value={formData.certifications}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="List your certifications (one per line)"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Availability
                    </label>
                    <div className="mt-2 space-y-4">
                      {Object.entries(formData.availability).map(
                        ([day, times]) => (
                          <div
                            key={day}
                            className="grid grid-cols-7 items-center gap-4"
                          >
                            <div className="col-span-2 capitalize">{day}</div>
                            <div className="col-span-2">
                              <input
                                type="time"
                                value={times.start}
                                onChange={(e) =>
                                  handleAvailabilityChange(
                                    day,
                                    'start',
                                    e.target.value
                                  )
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              />
                            </div>
                            <div className="col-span-1 text-center">to</div>
                            <div className="col-span-2">
                              <input
                                type="time"
                                value={times.end}
                                onChange={(e) =>
                                  handleAvailabilityChange(
                                    day,
                                    'end',
                                    e.target.value
                                  )
                                }
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Save Changes
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