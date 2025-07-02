// components/ProfileDropdown.js
import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white text-lg font-bold shadow-md">
          {initial}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/caregiver/profile')}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-sm text-gray-700 text-left'
                )}
              >
                My Profile
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/caregiver/schedule')}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-sm text-gray-700 text-left'
                )}
              >
                My Schedule
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/caregiver/bookings')}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-sm text-gray-700 text-left'
                )}
              >
                My Bookings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/caregiver/reviews')}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-sm text-gray-700 text-left'
                )}
              >
                My Reviews
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => navigate('/caregiver/upload-docs')}
                className={classNames(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-sm text-gray-700 text-left'
                )}
              >
                Upload Documents
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-red-100 text-red-700' : 'text-red-600',
                  'block w-full px-4 py-2 text-sm text-left'
                )}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
