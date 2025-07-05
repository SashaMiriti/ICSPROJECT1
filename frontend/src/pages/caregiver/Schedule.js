import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function Schedule() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [priceType, setPriceType] = useState('Fixed');

  useEffect(() => {
    // Fetch current schedule and pricing
    const fetchSchedule = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/caregivers/profile', {
          headers: { 'x-auth-token': token },
        });
        if (res.data.availability) {
          setSelectedDays(res.data.availability.days || []);
          if (res.data.availability.timeSlots && res.data.availability.timeSlots[0]) {
            setStartTime(res.data.availability.timeSlots[0].startTime || '09:00');
            setEndTime(res.data.availability.timeSlots[0].endTime || '17:00');
          }
        }
        if (res.data.hourlyRate) setHourlyRate(res.data.hourlyRate);
        if (res.data.priceType) setPriceType(res.data.priceType);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token]);

  const handleDayChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Update schedule
      await axios.put(
        'http://localhost:5000/api/caregivers/schedule',
        {
          days: selectedDays,
          time: { startTime, endTime },
        },
        {
          headers: { 'x-auth-token': token },
        }
      );
      // Update pricing - only if hourlyRate is provided
      if (hourlyRate && hourlyRate.trim() !== '') {
        await axios.put(
          'http://localhost:5000/api/caregivers/profile',
          {
            hourlyRate: parseFloat(hourlyRate),
            priceType,
          },
          {
            headers: { 'x-auth-token': token },
          }
        );
      }
      setMessage('Schedule and pricing saved successfully!');
    } catch (err) {
      setMessage('Error saving schedule or pricing.');
      console.error('Error saving schedule or pricing:', err);
    }
  };

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">My Weekly Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Select Available Days:</label>
          <div className="flex flex-wrap gap-3">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <label className="font-medium">Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-1 rounded"
          />
          <label className="font-medium">End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex gap-4 items-center">
          <label className="font-medium">Hourly Rate (Ksh):</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="border p-1 rounded"
            min="0"
            required
          />
          <label className="font-medium">Price Type:</label>
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="Fixed">Fixed</option>
            <option value="Negotiable">Negotiable</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
        >
          Save Schedule
        </button>
        {message && <div className="mt-2 text-center text-green-600">{message}</div>}
        {message && (
          <button
            onClick={() => navigate('/caregiver/dashboard')}
            className="fixed left-6 bottom-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded shadow-lg z-50"
            type="button"
          >
            ← Back to Dashboard
          </button>
        )}
      </form>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Schedule:</h3>
        {selectedDays.length === 0 ? (
          <p className="text-gray-500">No days selected.</p>
        ) : (
          <ul className="list-disc ml-6">
            {selectedDays.map((day) => (
              <li key={day}>
                {day}: {startTime} - {endTime}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <h4 className="font-semibold">Current Pricing:</h4>
          <p>Hourly Rate: <span className="font-bold">Ksh {hourlyRate || 'N/A'}</span></p>
          <p>Price Type: <span className="font-bold">{priceType || 'N/A'}</span></p>
        </div>
      </div>
    </div>
  );
}
