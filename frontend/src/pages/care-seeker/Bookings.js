import React from 'react';
import { Link } from 'react-router-dom';

const mockBookings = [
  {
    id: 1,
    caregiver: {
      id: 1,
      name: 'Jane Smith',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '17:00',
    status: 'confirmed',
    serviceType: 'Elderly Care',
  },
  {
    id: 2,
    caregiver: {
      id: 2,
      name: 'John Davis',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5',
    },
    date: '2024-03-25',
    startTime: '10:00',
    endTime: '14:00',
    status: 'pending',
    serviceType: 'Special Needs Care',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const statusStyles = {
  confirmed: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export default function Bookings() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all your bookings with caregivers.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              to="/care-seeker/search"
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Book New Service
            </Link>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Caregiver
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Service Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mockBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={booking.caregiver.imageUrl}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {booking.caregiver.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.serviceType}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={classNames(
                              statusStyles[booking.status],
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset'
                            )}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/care-seeker/caregiver/${booking.caregiver.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Caregiver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 