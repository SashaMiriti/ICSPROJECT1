// frontend/src/pages/CareSeekerProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure you have axios installed: npm install axios
import { useNavigate } from 'react-router-dom'; // Assuming React Router v6
import './CareSeekerProfilePage.css'; // Link to the CSS we'll create next

const CareSeekerProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        // Initialize with fields expected from CareSeeker model
        fullName: '',
        contactNumber: '',
        careType: [],
        medicalConditions: [],
        requiredTasks: [],
        caregiverGenderPreference: 'No Preference',
        languagePreferences: [],
        culturalConsiderations: '',
        schedule: { days: [], timeSlots: [{ startTime: '', endTime: '' }] }, // Ensure timeSlots has at least one obj for initial rendering
        location: { address: '', latitude: '', longitude: '' },
        budget: ''
    });
    const [userBasicInfo, setUserBasicInfo] = useState({ // For basic user info like email
        email: '',
        username: '',
        role: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Mock/Static options for dropdowns/checkboxes (can be fetched dynamically later)
    const careTypeOptions = ['Elderly Care', 'Child Care', 'Special Needs', 'Disability Support', 'Post-Op Recovery'];
    const requiredTaskOptions = ['Meal Prep', 'Bathing Assistance', 'Medication Reminders', 'Transportation', 'Light Housekeeping', 'Companionship'];
    const genderOptions = ['No Preference', 'Male', 'Female'];
    const languageOptions = ['English', 'Swahili', 'Luo', 'Kikuyu', 'French', 'German'];
    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                // Changed endpoint to /api/users/profile as per backend route
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { 'x-auth-token': token }
                });
                // Backend now sends { user, specificProfile }
                setUserBasicInfo(res.data.user);

                // Only set profile if specificProfile exists and is for a care seeker
                if (res.data.specificProfile && res.data.user.role === 'careSeeker') {
                     // Ensure schedule.timeSlots is an array and has at least one object
                    const fetchedSchedule = res.data.specificProfile.schedule || { days: [], timeSlots: [] };
                    if (!fetchedSchedule.timeSlots || fetchedSchedule.timeSlots.length === 0) {
                        fetchedSchedule.timeSlots = [{ startTime: '', endTime: '' }];
                    }
                    setProfile({
                        ...res.data.specificProfile,
                        schedule: fetchedSchedule
                    });
                } else {
                    // If no specific profile exists yet, or if it's a caregiver, initialize blank fields
                    setProfile(prev => ({
                        ...prev,
                        schedule: { days: [], timeSlots: [{ startTime: '', endTime: '' }] },
                        location: { address: '', latitude: '', longitude: '' }
                    }));
                }

            } catch (err) {
                console.error('Error fetching profile:', err.response ? err.response.data : err.message);
                setError('Failed to fetch profile. Please ensure you are logged in as a Care Seeker and your profile exists.');
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
            // Update the first time slot in the array
            setProfile(prev => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    timeSlots: prev.schedule.timeSlots.map((slot, index) =>
                        index === 0 ? { ...slot, [name]: value } : slot
                    )
                }
            }));
        } else if (name === "email" || name === "username") { // Handle basic user info fields if needed
            setUserBasicInfo(prev => ({ ...prev, [name]: value }));
        }
        else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleDayChange = (day) => {
        setProfile(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                days: prev.schedule.days.includes(day)
                    ? prev.schedule.days.filter(d => d !== day)
                    : [...prev.schedule.days, day]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        // Combine userBasicInfo fields with profile fields if needed for the PUT request
        // In our current backend PUT route, it expects them all in one body.
        const dataToSend = {
            ...profile,
            email: userBasicInfo.email, // Include email if it's updated on this form
            username: userBasicInfo.username // Include username if it's updated on this form
            // Do NOT send role or ID, backend uses token for that
        };

        try {
            // Changed endpoint to /api/users/profile
            const res = await axios.put('http://localhost:5000/api/users/profile', dataToSend, {
                headers: { 'x-auth-token': token }
            });
            // Update state with newly saved data
            setUserBasicInfo(res.data.user);
            if (res.data.specificProfile) {
                setProfile(res.data.specificProfile);
            }
            alert('Profile updated successfully!');
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            console.error('Error updating profile:', err.response ? err.response.data : err.message);
            setError('Failed to update profile. ' + (err.response?.data?.msg || 'Please try again.'));
        }
    };

    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (error) return <div className="profile-container error-message">{error}</div>;

    // Optional: If you want to restrict this page to only care seekers:
    if (userBasicInfo.role && userBasicInfo.role !== 'careSeeker') {
        return <div className="profile-container error-message">Access Denied: This page is for Care Seekers only.</div>;
    }

    return (
        <div className="profile-container">
            <h1>{profile.fullName || userBasicInfo.username || 'Care Seeker'} Profile</h1>

            {!isEditing ? (
                <div className="profile-view">
                    <p><strong>Username:</strong> {userBasicInfo.username}</p>
                    <p><strong>Email:</strong> {userBasicInfo.email}</p>
                    <p><strong>Role:</strong> {userBasicInfo.role}</p>
                    <hr /> {/* Separator for profile details */}
                    <p><strong>Full Name:</strong> {profile.fullName || 'Not specified'}</p>
                    <p><strong>Contact Number:</strong> {profile.contactNumber || 'Not specified'}</p>
                    <p><strong>Care Type:</strong> {profile.careType.join(', ') || 'Not specified'}</p>
                    <p><strong>Medical Conditions:</strong> {profile.medicalConditions.join(', ') || 'None'}</p>
                    <p><strong>Required Tasks:</strong> {profile.requiredTasks.join(', ') || 'Not specified'}</p>
                    <p><strong>Caregiver Gender Preference:</strong> {profile.caregiverGenderPreference}</p>
                    <p><strong>Language Preferences:</strong> {profile.languagePreferences.join(', ') || 'Any'}</p>
                    <p><strong>Cultural Considerations:</strong> {profile.culturalConsiderations || 'None'}</p>
                    <p><strong>Preferred Schedule:</strong></p>
                    <ul>
                        <li>Days: {profile.schedule.days.join(', ') || 'Not specified'}</li>
                        {profile.schedule.timeSlots.length > 0 && profile.schedule.timeSlots[0].startTime && (
                            <li>Time: {profile.schedule.timeSlots[0].startTime} - {profile.schedule.timeSlots[0].endTime}</li>
                        )}
                    </ul>
                    <p><strong>Location:</strong> {profile.location.address || 'Not specified'}</p>
                    {profile.location.latitude && profile.location.longitude && (
                        <p> (Lat: {profile.location.latitude}, Lon: {profile.location.longitude})</p>
                    )}
                    <p><strong>Budget:</strong> {profile.budget ? `Ksh ${profile.budget}` : 'Not specified'}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
            ) : (
                <form className="profile-form" onSubmit={handleSubmit}>
                    <h2>Basic User Information</h2>
                    <label>
                        Email:
                        <input type="email" name="email" value={userBasicInfo.email} onChange={handleChange} />
                    </label>
                    {/* If you allow changing username:
                    <label>
                        Username:
                        <input type="text" name="username" value={userBasicInfo.username} onChange={handleChange} />
                    </label>
                    */}
                    {/* Add password change fields if you want them on the same form */}
                    {/*
                    <label>Current Password: <input type="password" name="currentPassword" value={passwordFields.currentPassword} onChange={handlePasswordChange} /></label>
                    <label>New Password: <input type="password" name="newPassword" value={passwordFields.newPassword} onChange={handlePasswordChange} /></label>
                    */}

                    <h2>Care Seeker Profile Details</h2>
                    <label>
                        Full Name:
                        <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} />
                    </label>
                    <label>
                        Contact Number:
                        <input type="text" name="contactNumber" value={profile.contactNumber} onChange={handleChange} />
                    </label>

                    <label>
                        Care Type:
                        <select name="careType" multiple value={profile.careType} onChange={handleMultiSelectChange}>
                            {careTypeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple</small>
                    </label>

                    <label>
                        Medical Conditions (comma-separated):
                        <input
                            type="text"
                            name="medicalConditions"
                            value={profile.medicalConditions.join(', ')}
                            onChange={(e) => setProfile(prev => ({ ...prev, medicalConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                        />
                    </label>

                    <label>
                        Required Tasks:
                        <select name="requiredTasks" multiple value={profile.requiredTasks} onChange={handleMultiSelectChange}>
                            {requiredTaskOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple</small>
                    </label>

                    <label>
                        Caregiver Gender Preference:
                        <select name="caregiverGenderPreference" value={profile.caregiverGenderPreference} onChange={handleChange}>
                            {genderOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Language Preferences:
                        <select name="languagePreferences" multiple value={profile.languagePreferences} onChange={handleMultiSelectChange}>
                            {languageOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple</small>
                    </label>

                    <label>
                        Cultural Considerations:
                        <textarea name="culturalConsiderations" value={profile.culturalConsiderations} onChange={handleChange}></textarea>
                    </label>

                    <fieldset>
                        <legend>Preferred Schedule Days:</legend>
                        <div className="checkbox-group">
                            {dayOptions.map(day => (
                                <label key={day}>
                                    <input
                                        type="checkbox"
                                        checked={profile.schedule.days.includes(day)}
                                        onChange={() => handleScheduleDayChange(day)}
                                    /> {day}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Preferred Time Slot (e.g., 09:00 - 13:00):</legend>
                        {/* This example only handles the first time slot. For multiple, you'd need more complex state/UI */}
                        <label>
                            From:
                            <input type="time" name="startTime" value={profile.schedule.timeSlots[0]?.startTime || ''} onChange={handleChange} />
                        </label>
                        <label>
                            To:
                            <input type="time" name="endTime" value={profile.schedule.timeSlots[0]?.endTime || ''} onChange={handleChange} />
                        </label>
                    </fieldset>

                    <label>
                        Location Address:
                        <input type="text" name="address" value={profile.location.address} onChange={handleChange} />
                    </label>
                    <label>
                        Latitude (Optional):
                        <input type="number" name="latitude" value={profile.location.latitude} onChange={handleChange} />
                    </label>
                    <label>
                        Longitude (Optional):
                        <input type="number" name="longitude" value={profile.location.longitude} onChange={handleChange} />
                    </label>
                    <label>
                        Budget (Ksh, hourly/daily):
                        <input type="number" name="budget" value={profile.budget} onChange={handleChange} />
                    </label>

                    <div className="form-actions">
                        <button type="submit">Save Profile</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CareSeekerProfilePage;