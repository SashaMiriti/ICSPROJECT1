require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Models
const User = require('./models/User');
const Item = require('./models/Item');

<<<<<<< HEAD
// Import routes
=======
// Routes
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const caregiverRoutes = require('./routes/caregivers');
const careSeekerRoutes = require('./routes/careSeekers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
<<<<<<< HEAD
const adminRoutes = require('./routes/admin'); // ✅ Added admin routes
=======
const careNeedsRoutes = require('./routes/careNeedsRoutes');
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

<<<<<<< HEAD
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
=======
// Constants
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeythatshouldbeprotected';

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Parses JSON body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded body

// ✅ MongoDB Connection
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TogetherCare')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Socket.IO Events
io.on('connection', socket => {
  console.log('🔌 New client connected');

  socket.on('join', userId => socket.join(userId));
  socket.on('bookingUpdate', data => io.to(data.userId).emit('bookingUpdated', data));

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

<<<<<<< HEAD
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
=======
// ✅ Auth Middleware (for protected routes)
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// ✅ Sample API Routes (You can remove if not needed)
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching items' });
  }
});

app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Item name required' });
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d

  try {
    const newItem = new Item({ name, description });
<<<<<<< HEAD

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error adding item' });
    }
=======
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error adding item' });
  }
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

<<<<<<< HEAD
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
=======
    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting item' });
  }
});

// ✅ Routes Setup
app.use('/api/auth', authRoutes); // Login, Register, /me
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d
app.use('/api/users', userRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/care-seekers', careSeekerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
<<<<<<< HEAD
app.use('/api/admin', require ('./routes/admin')); 
=======
app.use('/api', careNeedsRoutes);
>>>>>>> 88c45fe332bfa7c7ce8907e33e16e2ac61c1473d

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// ✅ Static Files in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// ✅ Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
