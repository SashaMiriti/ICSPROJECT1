import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LocationPicker from '../../components/ui/LocationPicker';

// Utility function to generate time options from 06:00 to 18:00 in 30-minute intervals
function generateTimeOptions() {
    const options = [];
    for (let hour = 6; hour <= 18; hour++) {
        options.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour !== 18) options.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return options;
}

const CareSeekerProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [userBasicInfo, setUserBasicInfo] = useState({});
    const [profile, setProfile] = useState({
        fullName: '',
        contactNumber: '',
        careType: [],
        medicalConditions: [],
        requiredTasks: [],
        caregiverGenderPreference: 'No Preference',
        languagePreferences: [],
        culturalConsiderations: '',
        schedule: {
            days: [],
            timeSlots: [{ startTime: '', endTime: '' }]
        },
        location: {
            address: '',
            coordinates: [36.8219, -1.2921],
            latitude: '',
            longitude: ''
        },
        budget: '',
        specialNeeds: ''
    });
    const [selectedDates, setSelectedDates] = useState([]);
    const [timeSlots, setTimeSlots] = useState({});
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Options for form fields
    const careTypeOptions = ['Elderly Care', 'Child Care', 'Special Needs', 'Disability Support', 'Post-Op Recovery'];
    const requiredTaskOptions = ['Personal Care', 'Medication Management', 'Meal Preparation', 'Housekeeping', 'Transportation', 'Companionship', 'Physical Therapy', 'Medical Monitoring'];
    const genderOptions = ['Male', 'Female', 'No Preference'];
    const languageOptions = ['English', 'Swahili', 'Kikuyu', 'Luo', 'Kamba', 'Other'];

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch basic user info
                const userRes = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: { 'x-auth-token': token }
                });
                setUserBasicInfo(userRes.data);

                // Fetch care seeker profile
                const res = await axios.get('http://localhost:5000/api/care-seekers/profile', {
                    headers: { 'x-auth-token': token }
                });

                // Set the care seeker specific profile data
                let latitude = '';
                let longitude = '';
                if (Array.isArray(res.data.location?.coordinates) && res.data.location.coordinates.length === 2) {
                    longitude = res.data.location.coordinates[0];
                    latitude = res.data.location.coordinates[1];
                }
                setProfile({
                    fullName: res.data.fullName || '',
                    contactNumber: res.data.contactNumber || '',
                    careType: res.data.careType || [],
                    medicalConditions: res.data.medicalConditions || [],
                    requiredTasks: res.data.requiredTasks || [],
                    caregiverGenderPreference: res.data.caregiverGenderPreference || 'No Preference',
                    languagePreferences: res.data.languagePreferences || [],
                    culturalConsiderations: res.data.culturalConsiderations || '',
                    schedule: res.data.schedule || { days: [], timeSlots: [{ startTime: '', endTime: '' }] },
                    location: {
                        address: res.data.location?.address || 'Nairobi, Kenya',
                        coordinates: Array.isArray(res.data.location?.coordinates) && res.data.location.coordinates.length === 2
                            ? res.data.location.coordinates
                            : [36.8219, -1.2921],
                        latitude: latitude,
                        longitude: longitude
                    },
                    budget: res.data.budget || '',
                    specialNeeds: res.data.specialNeeds || ''
                });

                if (res.data.schedule && res.data.schedule.dates) {
                    setSelectedDates(res.data.schedule.dates.map(d => new Date(d.date)));
                    const slots = {};
                    res.data.schedule.dates.forEach(d => {
                        slots[d.date] = {
                            start: d.startTime ? new Date(d.startTime) : null,
                            end: d.endTime ? new Date(d.endTime) : null
                        };
                    });
                    setTimeSlots(slots);
                }

            } catch (err) {
                console.error('Error fetching profile:', err.response ? err.response.data : err.message);
                setError('Failed to fetch profile. Please ensure you are logged in as a Care Seeker.');
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "address" || name === "latitude" || name === "longitude") {
            setProfile(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [name]: value
                }
            }));
        } else if (name === "startTime" || name === "endTime") {
            setProfile(prev => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    timeSlots: prev.schedule.timeSlots.map((slot, index) =>
                        index === 0 ? { ...slot, [name]: value } : slot
                    )
                }
            }));
        } else if (name === "email" || name === "username") {
            setUserBasicInfo(prev => ({ ...prev, [name]: value }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (dates) => {
        setSelectedDates(dates || []);
        setTimeSlots(prev => {
            const newSlots = {};
            (dates || []).forEach(date => {
                const key = (date instanceof Date)
                    ? date.toISOString().split('T')[0]
                    : date.split('T')[0];
                newSlots[key] = prev[key] || { start: null, end: null };
            });
            return newSlots;
        });
    };

    const handleTimeChange = (dateKey, type, value) => {
        setTimeSlots(prev => ({
            ...prev,
            [dateKey]: {
                ...prev[dateKey],
                [type]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const timeSlotsArray = selectedDates.map(date => {
            const key = (date instanceof Date)
                ? date.toISOString().split('T')[0]
                : date.split('T')[0];
            const slot = timeSlots[key] || {};
            return {
                startTime: slot.start || '',
                endTime: slot.end || ''
            };
        });

        // Always ensure coordinates is an array of two numbers in the correct range for Nairobi
        let locationToSend = { ...profile.location };
        const isValidCoord = arr =>
            Array.isArray(arr) &&
            arr.length === 2 &&
            typeof arr[0] === 'number' &&
            typeof arr[1] === 'number' &&
            arr[0] >= 36 && arr[0] <= 37 && // Nairobi longitude
            arr[1] >= -2 && arr[1] <= -1;   // Nairobi latitude

        // Only build coordinates from latitude/longitude if both are valid
        const lon = parseFloat(profile.location.longitude);
        const lat = parseFloat(profile.location.latitude);
        const hasValidLatLng = !isNaN(lon) && !isNaN(lat) && lon >= 36 && lon <= 37 && lat >= -2 && lat <= -1;

        if (hasValidLatLng) {
            locationToSend = {
                type: 'Point',
                coordinates: [lon, lat],
                address: profile.location.address || 'Nairobi, Kenya'
            };
        } else if (!isValidCoord(locationToSend.coordinates)) {
            locationToSend = {
                type: 'Point',
                coordinates: [36.8219, -1.2921],
                address: 'Nairobi, Kenya'
            };
        } else {
            locationToSend.type = 'Point';
            locationToSend.address = locationToSend.address || 'Nairobi, Kenya';
        }
        console.log('Submitting location:', locationToSend);

        const dataToSend = {
            ...profile,
            schedule: {
                days: profile.schedule.days,
                timeSlots: timeSlotsArray
            },
            location: locationToSend,
            email: userBasicInfo.email,
            username: userBasicInfo.username
        };

        try {
            // Save profile first
            const res = await axios.put('http://localhost:5000/api/care-seekers/profile', dataToSend, {
                headers: { 'x-auth-token': token }
            });

            // After saving profile, trigger caregiver matching
            const matchingPayload = {
                careType: profile.careType.join(', '),
                schedule: `${profile.schedule.days.join(', ')} ${profile.schedule.timeSlots[0]?.startTime || ''} - ${profile.schedule.timeSlots[0]?.endTime || ''}`,
                specialNeeds: profile.specialNeeds,
                locationCoordinates: [
                    parseFloat(profile.location.longitude) || 36.8219, // Default to Nairobi if not provided
                    parseFloat(profile.location.latitude) || -1.2921
                ]
            };

            const matchingResponse = await axios.post('http://localhost:5000/api/match-caregivers', matchingPayload, {
                headers: { 'x-auth-token': token }
            });

            // Navigate to search results with matched caregivers
            navigate('/care-seeker/search', { 
                state: { 
                    matchedCaregivers: matchingResponse.data,
                    profileData: res.data 
                } 
            });

        } catch (err) {
            if (err.response?.data?.message === 'No caregivers found within your area') {
                setError('No caregivers found in your area. Please try a different location or check back later.');
            } else {
                setError('Failed to save profile or find caregivers. ' + (err.response?.data?.msg || 'Please try again.'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

    if (userBasicInfo.role && userBasicInfo.role !== 'careSeeker') {
        return <div className="min-h-screen flex items-center justify-center text-red-600">Access Denied: This page is for Care Seekers only.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-2">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-extrabold text-primary-700 mb-6 text-center tracking-tight">Care Seeker Profile</h1>
                    {loading && <div className="text-center text-lg text-blue-600 mb-4">Loading...</div>}
                    {error && <div className="text-center text-lg text-red-600 mb-4">{error}</div>}
                    {!isEditing ? (
                        <div className="space-y-8">
                            {/* Basic Info */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><span>👤</span> Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><span className="font-semibold">Username:</span> {userBasicInfo.username}</div>
                                    <div><span className="font-semibold">Email:</span> {userBasicInfo.email}</div>
                                    <div><span className="font-semibold">Full Name:</span> {profile.fullName || 'Not specified'}</div>
                                    <div><span className="font-semibold">Contact Number:</span> {profile.contactNumber || 'Not specified'}</div>
                                </div>
                            </section>
                            <hr/>
                            {/* Care Needs */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><span>🩺</span> Care Needs</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><span className="font-semibold">Care Type:</span> {profile.careType.join(', ') || 'Not specified'}</div>
                                    <div><span className="font-semibold">Medical Conditions:</span> {profile.medicalConditions.join(', ') || 'None'}</div>
                                    <div><span className="font-semibold">Required Tasks:</span> {profile.requiredTasks.join(', ') || 'Not specified'}</div>
                                    <div><span className="font-semibold">Special Needs:</span> {profile.specialNeeds || 'None'}</div>
                                    <div><span className="font-semibold">Budget:</span> {profile.budget ? `Ksh ${profile.budget}` : 'Not specified'}</div>
                                </div>
                            </section>
                            <hr/>
                            {/* Preferences */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><span>⭐</span> Preferences</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><span className="font-semibold">Caregiver Gender:</span> {profile.caregiverGenderPreference}</div>
                                    <div><span className="font-semibold">Languages:</span> {profile.languagePreferences.join(', ') || 'Any'}</div>
                                    <div className="md:col-span-2"><span className="font-semibold">Cultural Considerations:</span> {profile.culturalConsiderations || 'None'}</div>
                                </div>
                            </section>
                            <hr/>
                            {/* Schedule */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2"><span>📅</span> Preferred Schedule</h2>
                                {profile.schedule && profile.schedule.dates && profile.schedule.dates.length > 0 ? (
                                    <ul className="space-y-1">
                                        {profile.schedule.dates.map((d, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="font-medium">{new Date(d.date).toDateString()}</span>
                                                <span className="text-gray-600">{d.startTime || '--'} to {d.endTime || '--'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-gray-500">No schedule set</span>
                                )}
                            </section>
                            <hr/>
                            {/* Location */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2"><span>📍</span> Location</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                    <input type="text" name="address" value={profile.location.address || ''} onChange={handleChange} required placeholder="e.g., Westlands, Nairobi" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly={!showLocationPicker} />
                                </div>
                                {!showLocationPicker && (
                                    <button type="button" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowLocationPicker(true)}>
                                        Update Location
                                    </button>
                                )}
                                {showLocationPicker && (
                                    <div className="mt-4">
                                        <LocationPicker
                                            value={profile.location.coordinates}
                                            onChange={coords => setProfile(prev => ({
                                                ...prev,
                                                location: {
                                                    ...prev.location,
                                                    coordinates: coords,
                                                    longitude: coords[0],
                                                    latitude: coords[1]
                                                }
                                            }))}
                                        />
                                        <button type="button" className="mt-2 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setShowLocationPicker(false)}>
                                            Done
                                        </button>
                                    </div>
                                )}
                            </section>
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg shadow"
                                >
                                    Edit Profile & Find Caregivers
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Basic Info */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2"><span>👤</span> Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Full Name *</label>
                                        <input type="text" name="fullName" value={profile.fullName || ''} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your full name" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Contact Number *</label>
                                        <input type="text" name="contactNumber" value={profile.contactNumber || ''} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 0712345678" />
                                    </div>
                                </div>
                            </section>
                            {/* Care Needs */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2"><span>🩺</span> Care Needs</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Type of Care Needed *</label>
                                        <div className="flex flex-col gap-2">
                                            {careTypeOptions.map(option => (
                                                <label key={option} className="flex items-center text-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.careType.includes(option)}
                                                        onChange={e => {
                                                            setProfile(prev => ({
                                                                ...prev,
                                                                careType: e.target.checked
                                                                    ? [...prev.careType, option]
                                                                    : prev.careType.filter(val => val !== option)
                                                            }));
                                                        }}
                                                        className="mr-3 w-5 h-5"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Medical Conditions</label>
                                        <input type="text" name="medicalConditions" value={profile.medicalConditions.join(', ')} onChange={e => setProfile(prev => ({ ...prev, medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))} placeholder="e.g., Diabetes, Hypertension" className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Required Tasks *</label>
                                        <div className="flex flex-col gap-2">
                                            {requiredTaskOptions.map(option => (
                                                <label key={option} className="flex items-center text-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.requiredTasks.includes(option)}
                                                        onChange={e => {
                                                            setProfile(prev => ({
                                                                ...prev,
                                                                requiredTasks: e.target.checked
                                                                    ? [...prev.requiredTasks, option]
                                                                    : prev.requiredTasks.filter(val => val !== option)
                                                            }));
                                                        }}
                                                        className="mr-3 w-5 h-5"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Special Needs or Requests</label>
                                        <textarea name="specialNeeds" value={profile.specialNeeds} onChange={handleChange} rows={2} placeholder="Describe any special requirements..." className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Budget (Ksh per hour/day)</label>
                                        <input type="number" name="budget" value={profile.budget || ''} onChange={handleChange} placeholder="e.g., 500" className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </section>
                            {/* Preferences */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2"><span>⭐</span> Preferences</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Caregiver Gender Preference</label>
                                        <select name="caregiverGenderPreference" value={profile.caregiverGenderPreference} onChange={handleChange} className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {genderOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Language Preferences</label>
                                        <div className="flex flex-col gap-2">
                                            {languageOptions.map(option => (
                                                <label key={option} className="flex items-center text-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.languagePreferences.includes(option)}
                                                        onChange={e => {
                                                            setProfile(prev => ({
                                                                ...prev,
                                                                languagePreferences: e.target.checked
                                                                    ? [...prev.languagePreferences, option]
                                                                    : prev.languagePreferences.filter(val => val !== option)
                                                            }));
                                                        }}
                                                        className="mr-3 w-5 h-5"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Cultural Considerations</label>
                                        <textarea name="culturalConsiderations" value={profile.culturalConsiderations} onChange={handleChange} rows={2} placeholder="Any cultural or religious considerations..." className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </section>
                            {/* Schedule */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2"><span>📅</span> Preferred Schedule</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Select Preferred Dates</label>
                                        <DatePicker
                                            selected={null}
                                            onChange={dates => handleDateChange(Array.isArray(dates) ? dates : [dates])}
                                            inline
                                            highlightDates={selectedDates}
                                            selectsMultiple
                                            multiple
                                            value={selectedDates}
                                            minDate={new Date()}
                                        />
                                        <p className="text-lg text-gray-500 mt-2">Tap dates to select or deselect. You can pick multiple dates.</p>
                                    </div>
                                    {selectedDates.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-lg">Set Time for Each Date</h4>
                                            {selectedDates.map(date => {
                                                const key = (date instanceof Date)
                                                    ? date.toISOString().split('T')[0]
                                                    : date.split('T')[0];
                                                const timeOptions = generateTimeOptions();
                                                return (
                                                    <div key={key} className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                                                        <span className="w-40 text-lg">{date.toDateString()}</span>
                                                        <select value={timeSlots[key]?.start || ''} onChange={e => handleTimeChange(key, 'start', e.target.value)} className="border rounded p-3 text-lg">
                                                            <option value="">Start Time</option>
                                                            {timeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <span className="text-lg">to</span>
                                                        <select value={timeSlots[key]?.end || ''} onChange={e => handleTimeChange(key, 'end', e.target.value)} className="border rounded p-3 text-lg">
                                                            <option value="">End Time</option>
                                                            {timeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>
                            {/* Location */}
                            <section className="bg-gray-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-2xl font-bold text-primary-700 mb-4 flex items-center gap-2"><span>📍</span> Location</h2>
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-2">Address *</label>
                                    <input type="text" name="address" value={profile.location.address || ''} onChange={handleChange} required placeholder="e.g., Westlands, Nairobi" className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" readOnly={!showLocationPicker} />
                                </div>
                                {!showLocationPicker && (
                                    <button type="button" className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg text-lg" onClick={() => setShowLocationPicker(true)}>
                                        Update Location
                                    </button>
                                )}
                                {showLocationPicker && (
                                    <div className="mt-4">
                                        <LocationPicker
                                            value={profile.location.coordinates}
                                            onChange={coords => setProfile(prev => ({
                                                ...prev,
                                                location: {
                                                    ...prev.location,
                                                    coordinates: coords,
                                                    longitude: coords[0],
                                                    latitude: coords[1]
                                                }
                                            }))}
                                        />
                                        <button type="button" className="mt-2 bg-gray-500 text-white px-6 py-3 rounded-lg text-lg" onClick={() => setShowLocationPicker(false)}>
                                            Done
                                        </button>
                                    </div>
                                )}
                            </section>
                            {/* Confirmation Section */}
                            <section className="bg-green-50 rounded-xl p-6 shadow-inner border border-green-200">
                                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2"><span>✅</span> Review & Confirm</h2>
                                <ul className="text-lg space-y-2">
                                    <li><strong>Full Name:</strong> {profile.fullName}</li>
                                    <li><strong>Contact Number:</strong> {profile.contactNumber}</li>
                                    <li><strong>Care Type:</strong> {profile.careType.join(', ')}</li>
                                    <li><strong>Required Tasks:</strong> {profile.requiredTasks.join(', ')}</li>
                                    <li><strong>Budget:</strong> {profile.budget}</li>
                                    <li><strong>Location:</strong> {profile.location.address}</li>
                                </ul>
                                <p className="mt-4 text-green-700 text-lg">Please review your details above before saving. If everything looks good, click <strong>Save Profile & Find Caregivers</strong>.</p>
                            </section>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button type="submit" disabled={loading} className={`bg-green-600 text-white px-10 py-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-2xl shadow ${loading && 'opacity-50 cursor-not-allowed'}`}>{loading ? 'Saving & Finding Caregivers...' : 'Save Profile & Find Caregivers'}</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-10 py-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-bold text-2xl shadow">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareSeekerProfilePage; 