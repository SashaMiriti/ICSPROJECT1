import React from 'react';
import { useAuth } from '../../contexts/auth';

export default function CareSeekerDashboard() {
  const { user } = useAuth();

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* Replace with your content */}
        <div className="py-4">
          <div className="h-96 rounded-lg border-4 border-dashed border-gray-200">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900">
                Welcome back, {user?.name}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                This is your dashboard. Content coming soon...
              </p>
            </div>
          </div>
        </div>
        {/* /End replace */}
      </div>
    </div>
  );
} 