import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Optional: Add a simple admin navbar */}
      <header className="bg-primary-600 text-white py-4 px-6 shadow">
        <h1 className="text-2xl font-bold">TogetherCare Admin</h1>
      </header>

      <main className="flex-1 p-6">
        {children}
      </main>

      <footer className="bg-white text-center py-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
      </footer>
    </div>
  );
}
