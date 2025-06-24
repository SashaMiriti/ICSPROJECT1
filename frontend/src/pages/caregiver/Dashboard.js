     // frontend/src/pages/caregiver/Dashboard.js
     import React from 'react';
     import { Link } from 'react-router-dom';
 
     export default function CaregiverDashboard() {
       return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
           <div className="bg-white p-8 rounded-lg shadow-md text-center">
             <h1 className="text-3xl font-bold text-gray-800 mb-4">Caregiver Dashboard</h1>
             <p className="text-gray-600 mb-6">Welcome, Caregiver! Your account was successfully created.</p>
             <Link to="/login" className="text-blue-600 hover:underline">
               Go back to Login
             </Link>
             <p className="mt-4 text-sm text-gray-500">
               This is a placeholder page. You can build out your dashboard features here.
             </p>
           </div>
         </div>
       );
     }
     