// src/components/layout/MinimalLayout.js
import React from 'react';

export default function MinimalLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <header className="bg-green-700 text-white py-4 text-center text-xl font-semibold">
        TogetherCare
      </header>

      <main className="flex-grow">{children}</main>
  

      <footer className="bg-green-100 text-center text-sm text-gray-600 py-3">
        &copy; {new Date().getFullYear()} TogetherCare. All rights reserved.
      </footer>
    </div>
  );
}
