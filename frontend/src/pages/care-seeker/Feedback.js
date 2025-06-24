import React from 'react';

export default function Feedback({ onSubmit }) {
  return (
    <form className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8" aria-label="Feedback Form" onSubmit={e => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900" tabIndex={0}>Leave Feedback</h2>
      <div className="mb-4">
        <label htmlFor="rating" className="block text-lg font-medium text-gray-800 mb-2">Rating</label>
        <select id="rating" name="rating" required className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-required="true">
          <option value="">Select rating...</option>
          <option value="5">Excellent</option>
          <option value="4">Very Good</option>
          <option value="3">Good</option>
          <option value="2">Fair</option>
          <option value="1">Poor</option>
        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="comments" className="block text-lg font-medium text-gray-800 mb-2">Comments</label>
        <textarea id="comments" name="comments" rows={4} className="w-full p-3 text-lg rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600" aria-label="Comments" placeholder="Share your experience..." required />
      </div>
      <button type="submit" className="w-full bg-green-700 text-white text-xl font-bold py-4 rounded hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-400" aria-label="Submit Feedback">Submit Feedback</button>
    </form>
  );
} 