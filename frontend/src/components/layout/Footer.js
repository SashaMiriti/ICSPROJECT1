import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">TogetherCare</h3>
            <p className="text-gray-300 text-sm">
              Connecting caregivers with care seekers through a trusted platform.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white text-sm">
                  Find Care
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white text-sm">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services/elderly-care" className="text-gray-300 hover:text-white text-sm">
                  Elderly Care
                </Link>
              </li>
              <li>
                <Link to="/services/child-care" className="text-gray-300 hover:text-white text-sm">
                  Child Care
                </Link>
              </li>
              <li>
                <Link to="/services/disability-care" className="text-gray-300 hover:text-white text-sm">
                  Disability Care
                </Link>
              </li>
              <li>
                <Link to="/services/medical-care" className="text-gray-300 hover:text-white text-sm">
                  Medical Care
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">
                Email: support@togethercare.com
              </li>
              <li className="text-gray-300 text-sm">
                Phone: (123) 456-7890
              </li>
              <li className="text-gray-300 text-sm">
                Hours: Mon-Fri 9am-5pm
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-300 text-sm">
            © {new Date().getFullYear()} TogetherCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 