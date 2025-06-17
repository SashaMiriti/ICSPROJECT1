require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken');   // For creating and verifying JSON Web Tokens

// Import the User model (now with 'name', 'phone', 'role')
const User = require('./models/User'); 
// Import the Item model (now from its own file)
const Item = require('./models/Item');

const app = express();
const PORT = process.env.PORT || 5000; // Use port 5000 for backend

// Define a JWT secret key. BEST PRACTICE: Store this securely in your .env file!
// For development, we'll keep a fallback here.
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeythatshouldbeprotected'; 

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Authentication Middleware (for protecting routes) ---
function auth(req, res, next) {
    const token = req.header('x-auth-token'); // Get token from header

    // Check for token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Add user from payload
        req.user = decoded.user;
        next(); // Proceed to the next middleware/route handler
    } catch (e) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}


// --- API Routes for Items (unchanged functionality, just importing model) ---
// GET all items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(500).json({ message: 'Server Error fetching items' });
    }
});

// POST a new item (now potentially protected, we'll add 'auth' middleware later if needed)
app.post('/api/items', async (req, res) => {
    const { name, description } = req.body; // Destructure directly

    // Basic validation
    if (!name) {
        return res.status(400).json({ message: 'Please enter a name for the item' });
    }

    const newItem = new Item({ name, description });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message); // Log the actual error
        res.status(500).json({ message: 'Server Error adding item' });
    }
});

// DELETE an item (now potentially protected)
app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await Item.deleteOne({ _id: req.params.id }); // Using deleteOne for Mongoose 6+
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err.message); // Log the actual error
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Item ID format' });
        }
        res.status(500).json({ message: 'Server Error deleting item' });
    }
});


// --- NEW API Routes for Authentication (Adjusted for Chapter 4 schema) ---

// @route   POST /api/auth/register
// @desc    Register new user (Caregiver, Care Seeker, or Admin)
// @access  Public
app.post('/api/auth/register', async (req, res) => {
    // Extract name, email, password, phone, and role from the request body
    const { name, email, password, phone, role } = req.body;

    // Simple validation: ensure all required fields are present
    if (!name || !email || !password || !role) { // password is required so remove the double negation
        return res.status(400).json({ message: 'Please enter all required fields: Name, Email, Password, and Role.' });
    }

    // Basic validation for role to ensure it's one of the expected enums
    const allowedRoles = ['caregiver', 'care seeker', 'admin'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided. Role must be "caregiver", "care seeker", or "admin".' });
    }

    try {
        // Check for existing user by email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        
        // No explicit username unique check if 'name' is just full name and not a unique ID
        // If 'name' is intended to be a unique identifier like username, add a findOne here.
        // For 'name' as a full name, it typically isn't unique.

        // Create new user instance with all fields
        user = new User({
            name,
            email,
            password,
            phone, // Include phone if provided, it's optional per schema
            role
        });

        // Hash password for security
        const salt = await bcrypt.genSalt(10); // Generate a salt (random value)
        user.password = await bcrypt.hash(password, salt); // Hash the password with the salt

        // Save user to database
        await user.save();

        // Create and return JWT (JSON Web Token) for authentication
        const payload = {
            user: {
                id: user.id, // MongoDB's unique _id for the user
                role: user.role // Include role in JWT payload for client-side access control
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                // Send the token and basic user info (excluding password) back to the client
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        role: user.role,
                        phone: user.phone // Include phone if it exists
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    try {
        // Check for user existence by email
        let user = await User.findOne({ email });
        if (!user) {
            // Return generic 'Invalid Credentials' to avoid exposing if email exists
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // Compare provided password with hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // Create and return JWT if credentials are valid
        const payload = {
            user: {
                id: user.id,
                role: user.role // Include role in JWT payload
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        role: user.role,
                        phone: user.phone 
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// @route   GET /api/auth/user
// @desc    Get logged in user data (protected route example)
// @access  Private
// This route uses the 'auth' middleware to verify the token first
app.get('/api/auth/user', auth, async (req, res) => {
    try {
        // req.user.id is available from the 'auth' middleware after successful token verification
        // .select('-password') excludes the password hash from the returned user object
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching user data.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Backend ready to handle requests for items and authentication.');
});
