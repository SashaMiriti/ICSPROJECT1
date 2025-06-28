// src/components/layout/Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
<<<<<<< HEAD
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">
            <Link to="/">TogetherCare</Link>
          </h1>
          <nav className="space-x-4">
            <Link to="/about" className="text-gray-600 hover:text-green-600">About</Link>
            <Link to="/login" className="text-green-600 font-medium hover:underline">Login</Link>
            <Link to="/register" className="text-green-600 font-medium hover:underline">Register</Link>
          </nav>
=======
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user ? `/${user.role.replace(' ', '-')}/dashboard` : '/';
  const profilePath = user ? `/${user.role.replace(' ', '-')}/profile` : '/';

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    ...(user
      ? user.role === 'care seeker'
        ? [
            { name: 'Find Caregivers', href: '/care-seeker/search' },
            { name: 'My Bookings', href: '/care-seeker/bookings' },
          ]
        : [
            { name: 'My Schedule', href: '/caregiver/schedule' },
            { name: 'My Bookings', href: '/caregiver/bookings' },
            { name: 'My Reviews', href: '/caregiver/reviews' },
          ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-white shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <Link to="/" className="flex items-center text-2xl font-bold text-primary-600">
                    TogetherCare
                  </Link>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {user ? (
                    <Menu as="div" className="relative ml-3">
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {user.name[0].toUpperCase()}
                          </span>
                        </div>
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={dashboardPath}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to={profilePath}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Profile
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={handleLogout}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="space-x-4">
                      <Link to="/login" className="btn-secondary">Sign in</Link>
                      <Link to="/register" className="btn-primary">Sign up</Link>
                    </div>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              {user ? (
                <div className="border-t border-gray-200 pb-3 pt-4 px-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-800 font-medium">
                        {user.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      to={dashboardPath}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={profilePath}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pb-3 pt-4 px-4 space-y-2">
                  <Link to="/login" className="w-full block text-center btn-secondary">Sign in</Link>
                  <Link to="/register" className="w-full block text-center btn-primary">Sign up</Link>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

<<<<<<< HEAD
      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
=======
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {/* Social links here... */}
            </div>
            <p className="mt-8 text-base text-gray-400 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
            </p>
          </div>
        </div>
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
      </footer>
    </div>
  );
}
