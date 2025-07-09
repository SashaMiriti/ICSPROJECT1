import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const daysOfWeek = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export default function ProfileEdit() {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    specializationCategory: '',
    disabilitiesExplanation: '',
    locationAddress: '',
    locationCoordinates: [],
    hourlyRate: '',
    priceType: 'Fixed',
    experienceYears: '',
    languagesSpoken: [],
    tribalLanguage: '',
    gender: '',
    culture: '',
    religion: '',
    services: [],
    certifications: '',
    availability: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { enabled: false, start: '', end: '' } }), {}),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/caregivers/profile', {
          headers: { 'x-auth-token': token },
        });
        const data = res.data;
        setFormData((prev) => ({
          ...prev,
          username: data.fullName || data.user?.name || prev.username,
          email: data.user?.email || prev.email,
          phone: data.contactNumber || prev.phone,
          bio: data.bio || prev.bio,
          specializationCategory: data.specializationCategory || prev.specializationCategory,
          disabilitiesExplanation: data.disabilitiesExplanation || prev.disabilitiesExplanation,
          locationAddress: data.location?.address || prev.locationAddress,
          locationCoordinates: data.location?.coordinates || prev.locationCoordinates,
          hourlyRate: data.hourlyRate || prev.hourlyRate,
          priceType: data.priceType || prev.priceType,
          experienceYears: data.experienceYears || prev.experienceYears,
          languagesSpoken: data.languagesSpoken || prev.languagesSpoken,
          tribalLanguage: data.tribalLanguage || prev.tribalLanguage,
          gender: data.gender || prev.gender,
          culture: data.culture || prev.culture,
          religion: data.religion || prev.religion,
          services: data.servicesOffered || prev.services,
          certifications: data.qualifications?.join(', ') || prev.certifications,
          availability: data.availability && data.availability.days && data.availability.timeSlots
            ? daysOfWeek.reduce((acc, day, idx) => {
                const enabled = data.availability.days.includes(day.charAt(0).toUpperCase() + day.slice(1));
                const slot = data.availability.timeSlots[0] || { startTime: '', endTime: '' };
                acc[day] = {
                  enabled,
                  start: slot.startTime || '',
                  end: slot.endTime || '',
                };
                return acc;
              }, {})
            : prev.availability,
        }));
      } catch (err) {
        console.error('Error fetching caregiver profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const serviceOptions = [
    'Elderly Care',
    'Special Needs Care',
    'Child Care',
    'Medication Management',
    'Physical Therapy',
    'Companionship',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send changed fields, but always retain previous data
      const updateData = {
        fullName: formData.username,
        contactNumber: formData.phone,
        bio: formData.bio,
        specializationCategory: formData.specializationCategory,
        disabilitiesExplanation: formData.disabilitiesExplanation,
        location: {
          type: 'Point',
          coordinates: formData.locationCoordinates,
          address: formData.locationAddress
        },
        hourlyRate: formData.hourlyRate,
        priceType: formData.priceType,
        experienceYears: formData.experienceYears,
        languagesSpoken: formData.languagesSpoken,
        tribalLanguage: formData.tribalLanguage,
        gender: formData.gender,
        culture: formData.culture,
        religion: formData.religion,
        servicesOffered: formData.services,
        qualifications: formData.certifications.split(',').map((q) => q.trim()),
        availability: {
          days: daysOfWeek.filter((day) => formData.availability[day].enabled).map((d) => d.charAt(0).toUpperCase() + d.slice(1)),
          timeSlots: [
            {
              startTime: daysOfWeek.map((day) => formData.availability[day].start).find((v) => v) || '',
              endTime: daysOfWeek.map((day) => formData.availability[day].end).find((v) => v) || '',
            },
          ],
        },
      };
      await axios.put('http://localhost:5000/api/caregivers/profile', updateData, {
        headers: { 'x-auth-token': token },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating caregiver profile:', err);
    }
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

  const handleLanguageToggle = (language) => {
    setFormData((prev) => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter((l) => l !== language)
        : [...prev.languagesSpoken, language],
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

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          enabled: !prev.availability[day].enabled,
        },
      },
    }));
  };

  if (loading) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  // Profile display (card-like)
  if (!isEditing) {
  return (
      <div className="py-6 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Caregiver Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div><span className="font-semibold">Full Name:</span> {formData.username}</div>
              <div><span className="font-semibold">Email:</span> {formData.email}</div>
              <div><span className="font-semibold">Phone:</span> {formData.phone}</div>
              <div><span className="font-semibold">Bio:</span> {formData.bio}</div>
              <div><span className="font-semibold">Specialization:</span> {formData.specializationCategory}</div>
              {formData.disabilitiesExplanation && (
                <div><span className="font-semibold">Disability Specialization:</span> {formData.disabilitiesExplanation}</div>
              )}
              <div><span className="font-semibold">Experience Years:</span> {formData.experienceYears}</div>
              <div><span className="font-semibold">Hourly Rate:</span> Ksh {formData.hourlyRate}</div>
              <div><span className="font-semibold">Price Type:</span> {formData.priceType}</div>
              <div><span className="font-semibold">Gender:</span> {formData.gender}</div>
              <div><span className="font-semibold">Culture:</span> {formData.culture}</div>
              <div><span className="font-semibold">Religion:</span> {formData.religion}</div>
            </div>
            <div className="space-y-2">
              <div><span className="font-semibold">Languages:</span> {formData.languagesSpoken.join(', ')}</div>
              {formData.tribalLanguage && (
                <div><span className="font-semibold">Tribal Language:</span> {formData.tribalLanguage}</div>
              )}
              <div><span className="font-semibold">Services:</span> {formData.services.join(', ')}</div>
              <div><span className="font-semibold">Certifications:</span> {formData.certifications}</div>
              <div><span className="font-semibold">Location:</span> {formData.locationAddress}</div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Schedule & Availability</h3>
            
            {/* Schedule Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Available Days: </span>
                  <span className="text-green-600">
                    {daysOfWeek.filter(day => formData.availability[day].enabled).length > 0 
                      ? daysOfWeek.filter(day => formData.availability[day].enabled).map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
                      : 'No days selected'
                    }
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Working Hours: </span>
                  <span className="text-blue-600">
                    {formData.availability[daysOfWeek.find(day => formData.availability[day].enabled)]?.start && 
                     formData.availability[daysOfWeek.find(day => formData.availability[day].enabled)]?.end
                      ? `${formData.availability[daysOfWeek.find(day => formData.availability[day].enabled)].start} - ${formData.availability[daysOfWeek.find(day => formData.availability[day].enabled)].end}`
                      : 'Not set'
                    }
                  </span>
                </div>
              </div>
                    </div>

            {/* Detailed Schedule Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-3 py-2 text-left font-semibold">Day</th>
                    <th className="border px-3 py-2 text-center font-semibold">Available</th>
                    <th className="border px-3 py-2 text-center font-semibold">Start Time</th>
                    <th className="border px-3 py-2 text-center font-semibold">End Time</th>
                    <th className="border px-3 py-2 text-center font-semibold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map(day => {
                    const isAvailable = formData.availability[day].enabled;
                    const startTime = formData.availability[day].start;
                    const endTime = formData.availability[day].end;
                    
                    // Calculate hours if both times are set
                    let hours = '';
                    if (startTime && endTime) {
                      const start = new Date(`2000-01-01T${startTime}`);
                      const end = new Date(`2000-01-01T${endTime}`);
                      const diffHours = (end - start) / (1000 * 60 * 60);
                      hours = `${diffHours.toFixed(1)}h`;
                    }
                    
                    return (
                      <tr key={day} className={isAvailable ? 'bg-green-50' : 'bg-gray-50'}>
                        <td className="border px-3 py-2 capitalize font-medium">{day}</td>
                        <td className="border px-3 py-2 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isAvailable ? '✓ Available' : '✗ Not Available'}
                          </span>
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {startTime || '-'}
                        </td>
                        <td className="border px-3 py-2 text-center">
                          {endTime || '-'}
                        </td>
                        <td className="border px-3 py-2 text-center font-medium">
                          {hours || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
                    </div>

            {/* Schedule Statistics */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {daysOfWeek.filter(day => formData.availability[day].enabled).length}
                </div>
                <div className="text-sm text-gray-600">Available Days</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(() => {
                    const availableDays = daysOfWeek.filter(day => formData.availability[day].enabled);
                    let totalHours = 0;
                    availableDays.forEach(day => {
                      const startTime = formData.availability[day].start;
                      const endTime = formData.availability[day].end;
                      if (startTime && endTime) {
                        const start = new Date(`2000-01-01T${startTime}`);
                        const end = new Date(`2000-01-01T${endTime}`);
                        totalHours += (end - start) / (1000 * 60 * 60);
                      }
                    });
                    return totalHours.toFixed(1);
                  })()}
                </div>
                <div className="text-sm text-gray-600">Total Hours/Week</div>
                    </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const availableDays = daysOfWeek.filter(day => formData.availability[day].enabled);
                    if (availableDays.length === 0) return '0';
                    
                    const firstDay = availableDays[0];
                    const startTime = formData.availability[firstDay].start;
                    const endTime = formData.availability[firstDay].end;
                    
                    if (startTime && endTime) {
                      const start = new Date(`2000-01-01T${startTime}`);
                      const end = new Date(`2000-01-01T${endTime}`);
                      return ((end - start) / (1000 * 60 * 60)).toFixed(1);
                    }
                    return '0';
                  })()}
                </div>
                <div className="text-sm text-gray-600">Hours/Day</div>
              </div>
            </div>
          </div>
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-semibold"
            onClick={() => setIsEditing(true)}
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  // Edit form
  return (
    <div className="py-6 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-green-700">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization Category</label>
              <select name="specializationCategory" value={formData.specializationCategory} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Select Specialization</option>
                <option value="Elderly Care">Elderly Care</option>
                <option value="Persons with Disabilities">Persons with Disabilities</option>
              </select>
            </div>
            {formData.specializationCategory === 'Persons with Disabilities' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Disability Specialization</label>
                <textarea name="disabilitiesExplanation" value={formData.disabilitiesExplanation} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} placeholder="Describe the type of disabilities you specialize in" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Years</label>
              <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full border rounded px-3 py-2" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate (Ksh)</label>
              <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="w-full border rounded px-3 py-2" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price Type</label>
              <select name="priceType" value={formData.priceType} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="Fixed">Fixed</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Culture</label>
              <input type="text" name="culture" value={formData.culture} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Religion</label>
              <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location Address</label>
              <input type="text" name="locationAddress" value={formData.locationAddress} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter certifications separated by commas" />
            </div>
                    </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
            <div className="flex flex-wrap gap-4">
              {['English', 'Kiswahili', 'Tribal'].map(lang => (
                <label key={lang} className="flex items-center gap-1">
                      <input
                    type="checkbox"
                    checked={formData.languagesSpoken.includes(lang)}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  {lang}
                </label>
              ))}
                    </div>
            {formData.languagesSpoken.includes('Tribal') && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Tribal Language</label>
                <select name="tribalLanguage" value={formData.tribalLanguage} onChange={handleChange} className="w-full border rounded px-3 py-2">
                  <option value="">Select Tribal Language</option>
                  <option value="Kikuyu">Kikuyu</option>
                  <option value="Luhya">Luhya</option>
                  <option value="Luo">Luo</option>
                  <option value="Kamba">Kamba</option>
                  <option value="Kisii">Kisii</option>
                  <option value="Meru">Meru</option>
                  <option value="Other">Other</option>
                      </select>
                    </div>
            )}
                  </div>

                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(service => (
                <label key={service} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                          />
                            {service}
                          </label>
                      ))}
                    </div>
                  </div>

                  <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Day</th>
                  <th className="border px-2 py-1">Available</th>
                  <th className="border px-2 py-1">Start</th>
                  <th className="border px-2 py-1">End</th>
                </tr>
              </thead>
              <tbody>
                {daysOfWeek.map(day => (
                  <tr key={day}>
                    <td className="border px-2 py-1 capitalize">{day}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="checkbox"
                        checked={formData.availability[day].enabled}
                        onChange={() => handleDayToggle(day)}
                      />
                    </td>
                    <td className="border px-2 py-1">
                              <input
                                type="time"
                        value={formData.availability[day].start}
                        onChange={e => handleAvailabilityChange(day, 'start', e.target.value)}
                        disabled={!formData.availability[day].enabled}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border px-2 py-1">
                              <input
                                type="time"
                        value={formData.availability[day].end}
                        onChange={e => handleAvailabilityChange(day, 'end', e.target.value)}
                        disabled={!formData.availability[day].enabled}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                            </div>
          <div className="flex gap-4 mt-4">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow font-semibold">Save</button>
            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow font-semibold" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
} 