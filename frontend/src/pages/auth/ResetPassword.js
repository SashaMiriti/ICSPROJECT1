import React, { useState } from 'react'; // Removed '=>' from here
import { useParams, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('careseeker');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { resettoken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/reset-password/${resettoken}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset successful! You can now log in with your new password.');
                toast.success('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Failed to reset password. Invalid or expired token.');
                toast.error(data.error || 'Failed to reset password. Invalid or expired token.');
            }
        } catch (err) {
            console.error('Reset password network error:', err);
            setError('Network error or server unavailable. Please ensure the backend is running.');
            toast.error('Network error or server unavailable. Please ensure the backend is running.');
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Reset Password</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out pr-10"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out pr-10"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">My Role:</label>
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
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
