import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userNameInitial, setUserNameInitial] = useState('');
    const [userRole, setUserRole] = useState(null); // State to store the user's role

    // Effect to check authentication status and user details from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username'); // Assuming you store username on login
        const storedRole = localStorage.getItem('role'); // Assuming you store user role on login

        if (token) {
            setIsAuthenticated(true);
            setUserNameInitial(storedUsername ? storedUsername.charAt(0).toUpperCase() : 'U'); // 'U' for Unknown User
            setUserRole(storedRole);
        } else {
            setIsAuthenticated(false);
            setUserNameInitial('');
            setUserRole(null);
        }
    }, []); // Run once on component mount

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role'); // Clear role from localStorage too
        setIsAuthenticated(false);
        setUserNameInitial('');
        setUserRole(null);
        navigate('/login'); // Redirect to login after logout
    };

    // Determine the correct profile path based on the user's role
    const profilePath = isAuthenticated && userRole === 'careSeeker'
        ? '/care-seeker/profile' // Path for care seekers
        : isAuthenticated && userRole === 'caregiver'
        ? '/caregiver/profile'  // Path for caregivers
        : '/login'; // Default to login if not authenticated or role unknown

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#e8f5e9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#2e7d32', textDecoration: 'none', fontSize: '1.8rem', fontWeight: 'bold' }}>TogetherCare</Link>
                <div style={{ marginLeft: '30px' }}>
                    <Link to="/" style={{ margin: '0 15px', color: '#333', textDecoration: 'none' }}>Home</Link>
                    <Link to="/about" style={{ margin: '0 15px', color: '#333', textDecoration: 'none' }}>About</Link>
                    <Link to="/care-seeker/search" style={{ margin: '0 15px', color: '#333', textDecoration: 'none' }}>Find Caregivers</Link> {/* Directly link to search */}
                    <Link to="/my-bookings" style={{ margin: '0 15px', color: '#333', textDecoration: 'none' }}>My Bookings</Link>
                </div>
            </div>

            {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Dynamic profile link based on user role */}
                    <Link to={profilePath} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#a5d6a7', /* Lighter green */
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        textDecoration: 'none',
                        marginRight: '15px'
                    }}>
                        {userNameInitial}
                    </Link>
                    <button onClick={handleLogout} style={{
                        padding: '8px 15px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}>
                        Logout
                    </button>
                </div>
            ) : (
                <div>
                    <Link to="/login" style={{ margin: '0 10px', color: '#333', textDecoration: 'none' }}>Login</Link>
                    <Link to="/register" style={{ padding: '8px 15px', backgroundColor: '#2e7d32', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Register</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
