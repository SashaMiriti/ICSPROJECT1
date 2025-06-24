import React from 'react';

export default function NeedsForm({ onSubmit }) {
  return (
    <form className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md" aria-label="Care Needs Form" onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900" tabIndex={0}>Tell us about your care needs</h2>
      <div className="mb-4">
        <label htmlFor="careType" className="block text-lg font-medium text-gray-800 mb-2">Type of Care Needed</label>
        <select id="careType" name="careType" required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true">
          <option value="">Select...</option>
          <option value="elderly">Elderly Care</option>
          <option value="special">Special Needs</option>
          <option value="child">Child Care</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="location" className="block text-lg font-medium text-gray-800 mb-2">Location</label>
        <input id="location" name="location" type="text" required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true" aria-label="Location" />
      </div>
      <div className="mb-4">
        <label htmlFor="schedule" className="block text-lg font-medium text-gray-800 mb-2">Preferred Schedule</label>
        <input id="schedule" name="schedule" type="text" required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true" aria-label="Preferred Schedule" placeholder="e.g. Weekdays, 9am-1pm" />
      </div>
      <div className="mb-6">
        <label htmlFor="specialNeeds" className="block text-lg font-medium text-gray-800 mb-2">Special Needs or Requests</label>
        <textarea id="specialNeeds" name="specialNeeds" rows={3} className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-label="Special Needs or Requests" placeholder="Describe any special requirements..." />
      </div>
      <button type="submit" className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label="Continue to caregiver search">Continue</button>
      <button type="button" onClick={() => window.history.back()} className="w-full bg-gray-700 text-white text-xl font-bold py-4 rounded mt-4 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400" aria-label="Back to dashboard">Back to Dashboard</button>
    </form>
  );
} 