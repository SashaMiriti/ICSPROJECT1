import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BookingForm() {
  const { id: caregiverId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [caregiver, setCaregiver] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    specializationCategory: '',
    notes: '',
    location: {
      address: '',
      coordinates: []
    },
    budget: '',
  });

  // Fetch caregiver details and care seeker's location on component mount
  useEffect(() => {
    const fetchCaregiverDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/caregivers/${caregiverId}`);
        setCaregiver(response.data.caregiver);
        
        // Pre-fill specializationCategory with caregiver's value if available
        if (response.data.caregiver.specializationCategory) {
          setFormData(prev => ({
            ...prev,
            specializationCategory: response.data.caregiver.specializationCategory
          }));
        }
        // Pre-fill budget with caregiver's hourlyRate if available
        if (typeof response.data.caregiver.hourlyRate === 'number' && !isNaN(response.data.caregiver.hourlyRate)) {
          setFormData(prev => ({
            ...prev,
            budget: response.data.caregiver.hourlyRate
          }));
        }
      } catch (error) {
        console.error('Error fetching caregiver details:', error);
        if (error.response?.status === 404) {
          toast.error('Caregiver not found');
        } else {
          toast.error('Failed to load caregiver details');
        }
      }
    };

    const fetchCareSeekerProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/care-seekers/profile', {
          headers: { 'x-auth-token': token }
        });
        
        if (response.data.location) {
          setFormData(prev => ({
            ...prev,
            location: {
              address: response.data.location.address || '',
              coordinates: response.data.location.coordinates || []
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching care seeker profile:', error);
      }
    };

    fetchCaregiverDetails();
    fetchCareSeekerProfile();
  }, [caregiverId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.specializationCategory) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Combine date and time
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      // Validate time logic
      if (startDateTime >= endDateTime) {
        toast.error('End time must be after start time');
        setLoading(false);
        return;
      }

      if (startDateTime <= new Date()) {
        toast.error('Cannot book in the past');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to make a booking');
        navigate('/login');
        return;
      }

      // Prepare booking payload
      const bookingPayload = {
        caregiverId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        service: formData.specializationCategory,
        notes: formData.notes,
        location: {
          address: formData.location.address,
          coordinates: formData.location.coordinates
        },
        budget: formData.budget,
      };

      // Submit booking
      const response = await axios.post('http://localhost:5000/api/bookings', bookingPayload, {
        headers: { 'x-auth-token': token }
      });

      toast.success('Booking submitted successfully!');
      navigate('/care-seeker/bookings', { 
        state: { 
          newBooking: response.data,
          message: 'Your booking has been submitted and is pending caregiver approval.'
        } 
      });

    } catch (error) {
      console.error('Booking submission error:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid booking data');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to make bookings');
      } else if (error.response?.status === 404) {
        toast.error('Caregiver not found');
      } else {
        toast.error('Failed to submit booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const getTotalHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    const diff = (end - start) / (1000 * 60 * 60); // hours
    return diff > 0 ? diff : 0;
  };

  const totalCost = caregiver && caregiver.hourlyRate ? caregiver.hourlyRate * getTotalHours() : 0;

  if (!caregiver) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading caregiver details...</p>
          </div>
        </div>
      </div>
    );
  }

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
                Please fill in the details for your booking request with {caregiver.fullName}.
              </p>
              
              {/* Caregiver Info Card */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Caregiver Information</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Name:</strong> {caregiver.fullName}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Rate:</strong> Ksh {caregiver.hourlyRate}/hr
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Experience:</strong> {caregiver.experienceYears} years
                </p>
                {caregiver.specializations && caregiver.specializations.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Specializations:</strong> {caregiver.specializations.join(', ')}
                  </p>
                )}
                {/* Caregiver Schedule/Availability */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">Available Schedule</h5>
                  {/* Detailed availability */}
                  {caregiver.availability && caregiver.availability.days && caregiver.availability.days.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Available Days:</strong> {caregiver.availability.days.join(', ')}
                      </p>
                      {caregiver.availability.timeSlots && caregiver.availability.timeSlots.length > 0 && (
                        <p className="text-sm text-gray-600">
                          <strong>Available Hours:</strong> {caregiver.availability.timeSlots.map((slot, idx) => (
                            <span key={idx}>{slot.startTime || 'Flexible'} - {slot.endTime || 'Flexible'}{idx < caregiver.availability.timeSlots.length - 1 ? ', ' : ''}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  ) : caregiver.schedule && (caregiver.schedule.days || caregiver.schedule.time) ? (
                    <div className="space-y-1">
                      {caregiver.schedule.days && (
                        <p className="text-sm text-gray-600">
                          <strong>Days:</strong> {caregiver.schedule.days}
                        </p>
                      )}
                      {caregiver.schedule.time && (
                        <p className="text-sm text-gray-600">
                          <strong>Time:</strong> {caregiver.schedule.time}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Schedule not specified</p>
                  )}
                </div>
                {/* Services Offered */}
                {caregiver.servicesOffered && caregiver.servicesOffered.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Services Offered</h5>
                    <div className="flex flex-wrap gap-1">
                      {caregiver.servicesOffered.map((service, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
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
                        Start Time *
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
                        End Time *
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
                        htmlFor="specializationCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Service Type *
                      </label>
                      <input
                        type="text"
                        id="specializationCategory"
                        name="specializationCategory"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-100 cursor-not-allowed"
                        value={formData.specializationCategory}
                        readOnly
                        tabIndex={-1}
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="locationAddress"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Service Location *
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="locationAddress"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter the address where care will be provided"
                        value={formData.location.address}
                        onChange={handleLocationChange}
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Proposed Budget (Ksh)</label>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Enter your proposed budget"
                      />
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
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mr-3 inline-flex justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Booking'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {caregiver && (
          <div className="mt-4">
            <p className="text-sm text-gray-700">Caregiver's Rate: <span className="font-bold">Ksh {caregiver.hourlyRate} per hour</span></p>
            <p className="text-sm text-gray-700">Total Cost: <span className="font-bold">Ksh {totalCost}</span></p>
          </div>
        )}
      </div>
    </div>
  );
} 