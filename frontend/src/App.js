import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Assuming basic styling from create-react-app is still desired

// --- Frontend Components (will be created below or inline for simplicity) ---

// Placeholder for the main dashboard content (after login)
const Dashboard = ({ user, onLogout }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: '#007bff' }}>Welcome, {user.name}!</h2>
      <p>You are logged in as a {user.role}.</p>
      <p>Your email: {user.email}</p>
      {user.phone && <p>Your phone: {user.phone}</p>}
      <button
        onClick={onLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          backgroundColor: '#dc3545',
          color: 'white',
          fontSize: '1em',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        Logout
      </button>
      <h3 style={{ marginTop: '40px', color: '#555' }}>Your Items (from previous step)</h3>
      {/* The item list from your previous App.js will go here later, or be a separate component */}
      <p>This is where your item management or specific role-based content will appear.</p>
    </div>
  );
};


// Register Component
const Register = ({ onRegisterSuccess, onError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('care seeker'); // Default role as per typical user flow

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your backend registration endpoint
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        phone,
        role,
      });
      console.log('Registration successful:', res.data);
      onRegisterSuccess(res.data.token, res.data.user); // Pass token and user data to parent
    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err);
      onError(err.response ? err.response.data.message || 'Registration failed.' : 'Registration failed. Network error.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <input
          type="tel" // Use tel for phone number input
          placeholder="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em', backgroundColor: 'white' }}
        >
          <option value="care seeker">Care Seeker</option>
          <option value="caregiver">Caregiver</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          style={{
            padding: '12px 25px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '1.1em',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

// Login Component
const Login = ({ onLoginSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make a POST request to your backend login endpoint
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      console.log('Login successful:', res.data);
      onLoginSuccess(res.data.token, res.data.user); // Pass token and user data to parent
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      onError(err.response ? err.response.data.message || 'Login failed.' : 'Login failed. Network error.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1em' }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 25px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '1.1em',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};


// Main App Component
function App() {
  // State to hold the authentication token
  const [token, setToken] = useState(localStorage.getItem('token')); // Try to get token from local storage
  // State to hold user data (id, name, email, role, phone)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user'))); // Try to get user from local storage
  // State to manage current view: 'login', 'register', 'dashboard'
  const [currentView, setCurrentView] = useState(token ? 'dashboard' : 'login');
  // State for displaying general messages/errors to the user
  const [message, setMessage] = useState('');

  // Function to handle successful registration or login
  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken); // Store token in local storage
    localStorage.setItem('user', JSON.stringify(newUser)); // Store user data in local storage
    setToken(newToken);
    setUser(newUser);
    setCurrentView('dashboard'); // Redirect to dashboard
    setMessage('Authentication successful!');
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('user'); // Remove user data from local storage
    setToken(null);
    setUser(null);
    setCurrentView('login'); // Redirect to login page
    setMessage('Logged out successfully.');
  };

  // Function to display an error message
  const displayError = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  // Check token on app load or token change
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setCurrentView('dashboard');
    } else {
      setToken(null);
      setUser(null);
      setCurrentView('login');
    }
  }, []);


  // Simple navigation/routing based on currentView state
  const renderView = () => {
    switch (currentView) {
      case 'register':
        return <Register onRegisterSuccess={handleAuthSuccess} onError={displayError} />;
      case 'login':
        return <Login onLoginSuccess={handleAuthSuccess} onError={displayError} />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <Login onLoginSuccess={handleAuthSuccess} onError={displayError} />;
    }
  };

  return (
    <div className="App" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '100vw', margin: '0 auto', padding: '0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Simple Navigation Bar */}
      <nav style={{ backgroundColor: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 10px 10px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8em' }}>Together Care</h1>
        <div>
          {!token ? ( // Show these links if not logged in
            <>
              <button onClick={() => setCurrentView('register')} style={navButtonStyle}>Register</button>
              <button onClick={() => setCurrentView('login')} style={navButtonStyle}>Login</button>
            </>
          ) : ( // Show these links if logged in
            <>
              <button onClick={() => setCurrentView('dashboard')} style={navButtonStyle}>Dashboard</button>
              <button onClick={handleLogout} style={{ ...navButtonStyle, backgroundColor: '#dc3545' }}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {/* Message/Error Display */}
      {message && (
        <div style={{ textAlign: 'center', margin: '20px auto', padding: '10px 20px', borderRadius: '5px', backgroundColor: message.includes('failed') || message.includes('error') ? '#ffdddd' : '#d4edda', color: message.includes('failed') || message.includes('error') ? '#721c24' : '#155724', border: message.includes('failed') || message.includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb', maxWidth: '600px' }}>
          {message}
        </div>
      )}

      {/* Render the current view/component */}
      <main style={{ flexGrow: 1, padding: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        {renderView()}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#333', color: 'white', textAlign: 'center', padding: '15px 20px', marginTop: 'auto', borderRadius: '10px 10px 0 0' }}>
        <p>&copy; {new Date().getFullYear()} Together Care. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Inline style for navigation buttons
const navButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  padding: '10px 15px',
  margin: '0 5px',
  cursor: 'pointer',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease',
  ':hover': {
    backgroundColor: '#555',
  },
};

export default App;
