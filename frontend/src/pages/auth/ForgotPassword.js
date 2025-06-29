import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('careseeker');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // FIX: Use the absolute URL for the backend API endpoint
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email}),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('If an account with that email exists, a password reset link has been sent to your email.');
                setEmail(''); // Clear email field
                toast.success('Password reset link sent!');
            } else {
                setError(data.error || 'Failed to send password reset email. Please check your email and selected role.'); // More specific error
                toast.error(data.error || 'Failed to send password reset email. Please check your email and selected role.');
            }
        } catch (err) {
            console.error('Forgot password network error:', err); // Log the actual network error
            setError('Network error or server unavailable. Please ensure the backend is running.'); // More informative error
            toast.error('Network error or server unavailable. Please ensure the backend is running.');
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-6">Forgot Password</h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a:</label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="careseeker">Care Seeker</option>
                            <option value="caregiver">Caregiver</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center -mt-4">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="text-green-600 text-sm text-center -mt-4">
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition duration-150 ease-in-out">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
