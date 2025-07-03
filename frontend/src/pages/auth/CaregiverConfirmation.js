import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MinimalLayout from '../../components/layout/MinimalLayout';

export default function CaregiverConfirmation() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const name = params.get('name');
  const status = params.get('status');

  const isRejected = status === 'rejected';

  return (
    <MinimalLayout>
      <div className={`max-w-lg mx-auto bg-white p-8 mt-20 rounded-xl shadow-md text-center border ${
        isRejected ? 'border-red-200' : 'border-green-200'
      }`}>
        <h1 className={`text-3xl font-bold mb-4 ${
          isRejected ? 'text-red-700' : 'text-green-700'
        }`}>
          {name ? `Hello, ${name}` : (isRejected ? 'Application Status' : 'Application Submitted ✅')}
        </h1>
        
        {isRejected ? (
          <>
            <p className="text-gray-700 leading-relaxed mb-4">
              We regret to inform you that your caregiver application has been <strong className="text-red-600">rejected</strong> at this time.
            </p>
            <p className="text-gray-600 mb-6">
              If you believe this was a mistake or would like to apply again, please contact our support team or visit our site again in the future.
            </p>
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition"
              >
                Return to Home
              </Link>
              <br />
              <a
                href="mailto:support@togethercare.com"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
              >
                Contact Support
              </a>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </MinimalLayout>
  );
}
