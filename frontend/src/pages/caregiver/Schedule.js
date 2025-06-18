import React, { useState } from 'react';

const mockSchedule = [
  {
    id: 1,
    client: 'Sarah Johnson',
    date: '2024-03-20',
    startTime: '09:00',
    endTime: '17:00',
    service: 'Elderly Care',
    status: 'confirmed',
    location: '123 Main St, San Francisco, CA',
  },
  {
    id: 2,
    client: 'Michael Brown',
    date: '2024-03-20',
    startTime: '18:00',
    endTime: '20:00',
    service: 'Special Needs Care',
    status: 'pending',
    location: '456 Oak Ave, San Francisco, CA',
  },
  {
    id: 3,
    client: 'Emily Davis',
    date: '2024-03-21',
    startTime: '10:00',
    endTime: '14:00',
    service: 'Child Care',
    status: 'confirmed',
    location: '789 Pine St, San Francisco, CA',
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

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState('');

  const filteredSchedule = selectedDate
    ? mockSchedule.filter((item) => item.date === selectedDate)
    : mockSchedule;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">My Schedule</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and manage your upcoming care services.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
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
                        Client
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
                        Service
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredSchedule.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {item.client}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.startTime} - {item.endTime}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.service}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.location}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={classNames(
                              statusStyles[item.status],
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset'
                            )}
                          >
                            {item.status}
                          </span>
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