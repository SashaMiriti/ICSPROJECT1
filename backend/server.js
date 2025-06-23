require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken');   // For creating and verifying JSON Web Tokens
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import the User model (now with 'name', 'phone', 'role')
const User = require('./models/User'); 
// Import the Item model (now from its own file)
const Item = require('./models/Item');

// Import routes (we'll create these next)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const caregiverRoutes = require('./routes/caregivers');
const careSeekerRoutes = require('./routes/careSeekers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000; // Use port 5000 for backend

// Define a JWT secret key. BEST PRACTICE: Store this securely in your .env file!
// For development, we'll keep a fallback here.
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeythatshouldbeprotected'; 

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TogetherCare')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('bookingUpdate', (data) => {
        io.to(data.userId).emit('bookingUpdated', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

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
// Basic route for the homepage
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/care-seekers', careSeekerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    });
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Backend ready to handle requests for items and authentication.');
});
