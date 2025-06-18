import React from 'react';

const mockBookings = [
  {
    id: 1,
    client: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 123-4567',
    },
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '17:00',
    service: 'Elderly Care',
    status: 'confirmed',
    location: '123 Main St, San Francisco, CA',
    notes: 'Medication reminders needed. Light housekeeping included.',
  },
  {
    id: 2,
    client: {
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '(555) 987-6543',
    },
    date: '2024-03-22',
    startTime: '14:00',
    endTime: '18:00',
    service: 'Special Needs Care',
    status: 'pending',
    location: '456 Oak Ave, San Francisco, CA',
    notes: 'First-time client. Requires assistance with daily activities.',
  },
];

const statusStyles = {
  confirmed: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Bookings() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Booking Requests
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and manage your care service bookings.
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="min-w-full divide-y divide-gray-300">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="bg-white">
                      <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8">
                        <div className="sm:flex lg:col-span-7">
                          <div className="mt-6 sm:mt-0">
                            <h3 className="text-base font-medium text-gray-900">
                              {booking.client.name}
                            </h3>
                            <div className="mt-1 flex items-center">
                              <span
                                className={classNames(
                                  statusStyles[booking.status],
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset'
                                )}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-900">
                              {booking.service}
                            </p>
                            <div className="mt-3 space-y-2 text-sm text-gray-500">
                              <p>Date: {booking.date}</p>
                              <p>
                                Time: {booking.startTime} - {booking.endTime}
                              </p>
                              <p>Location: {booking.location}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 lg:col-span-5 lg:mt-0">
                          <dl className="space-y-4 text-sm text-gray-600">
                            <div>
                              <dt className="font-medium text-gray-900">
                                Contact Information
                              </dt>
                              <dd className="mt-2">
                                <div className="space-y-1">
                                  <p>Email: {booking.client.email}</p>
                                  <p>Phone: {booking.client.phone}</p>
                                </div>
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-gray-900">Notes</dt>
                              <dd className="mt-2 whitespace-pre-wrap">
                                {booking.notes}
                              </dd>
                            </div>
                          </dl>

                          {booking.status === 'pending' && (
                            <div className="mt-6 flex space-x-3">
                              <button
                                type="button"
                                className="flex-1 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 