// src/components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* <Navbar /> */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
