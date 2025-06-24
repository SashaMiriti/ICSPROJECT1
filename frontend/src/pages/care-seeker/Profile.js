import React from 'react';
import { useAuth } from '../../contexts/auth';

export default function Profile({ user = { name: 'Mary Johnson', email: 'mary@email.com', phone: '555-123-4567', preferences: 'Elderly Care, Weekdays' }, onSave }) {
  const { user: authUser } = useAuth();

  return (
    <form className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8" aria-label="Profile Form" onSubmit={e => { e.preventDefault(); onSave && onSave(); }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900" tabIndex={0}>My Profile</h2>
      <div className="mb-4">
        <label htmlFor="name" className="block text-lg font-medium text-gray-800 mb-2">Name</label>
        <input id="name" name="name" type="text" defaultValue={user.name} required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true" />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-lg font-medium text-gray-800 mb-2">Email</label>
        <input id="email" name="email" type="email" defaultValue={user.email} required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true" />
      </div>
      <div className="mb-4">
        <label htmlFor="phone" className="block text-lg font-medium text-gray-800 mb-2">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={user.phone} required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true" />
      </div>
      <div className="mb-6">
        <label htmlFor="preferences" className="block text-lg font-medium text-gray-800 mb-2">Care Preferences</label>
        <input id="preferences" name="preferences" type="text" defaultValue={user.preferences} className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-label="Care Preferences" />
      </div>
      <button type="submit" className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label="Save Profile">Save Profile</button>
    </form>
  );
} 