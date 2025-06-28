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

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const caregiverRoutes = require('./routes/caregivers');
const careSeekerRoutes = require('./routes/careSeekers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin'); // ✅ Added admin routes

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeythatshouldbeprotected'; 

const testEmailRoutes = require('./routes/testEmail');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/test', testEmailRoutes);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

// --- Authentication Middleware ---
function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

// --- API Routes for Items ---
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error fetching items' });
    }
});

app.post('/api/items', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Please enter a name for the item' });
    }

    const newItem = new Item({ name, description });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error adding item' });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await Item.deleteOne({ _id: req.params.id });
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Item ID format' });
        }
        res.status(500).json({ message: 'Server Error deleting item' });
    }
});

// Basic route for homepage
app.get('/', (req, res) => {
    res.send('API is running...');
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/care-seekers', careSeekerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', require ('./routes/admin')); 

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
