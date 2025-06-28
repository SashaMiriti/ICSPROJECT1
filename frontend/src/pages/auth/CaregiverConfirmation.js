import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MinimalLayout from '../../components/layout/MinimalLayout';

export default function CaregiverConfirmation() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const name = params.get('name');

  return (
    <MinimalLayout>
      <div className="max-w-lg mx-auto bg-white p-8 mt-20 rounded-xl shadow-md text-center border border-green-200">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          {name ? `Thank you, ${name}!` : 'Application Submitted ✅'}
        </h1>
        <p className="text-gray-700 leading-relaxed mb-4">
          Your caregiver application has been received and is currently under review by our admin team.
        </p>
        <p className="text-gray-600 mb-6">
          Once approved, you will receive an email and can then log in to access your dashboard.
        </p>
        <Link
          to="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md transition"
        >
          Return to Home
        </Link>
      </div>
    </MinimalLayout>
  );
}
