require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const matchingRoutes = require('./routes/matchingRoutes');

// Models
const User = require('./models/User');
const Item = require('./models/Item');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const caregiverRoutes = require('./routes/caregivers');
const careSeekerRoutes = require('./routes/careSeekers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const careNeedsRoutes = require('./routes/careNeedsRoutes');
const testEmailRoutes = require('./routes/testEmail');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeythatshouldbeprotected';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/test', testEmailRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TogetherCare')
  .then(() => {
    const db = mongoose.connection;
    const conn = db.client.s.options;
    console.log('✅ MongoDB connected');
    console.log('📦 Connected to database:', db.name);
    console.log('🌐 Host:', conn?.hosts ? conn.hosts.map(h => h.host + ':' + h.port).join(', ') : conn?.host + ':' + conn?.port);
    console.log('🔗 Replica Set/Cluster:', conn.replicaSet || 'N/A');
    console.log('🔑 Connection String:', (process.env.MONGODB_URI || 'mongodb://localhost:27017/TogetherCare').replace(/(mongodb(\+srv)?:\/\/)(.*?):(.*?)@/, '$1<user>:<password>@'));
    if (conn.srvHost) {
      console.log('🟢 Atlas SRV Host:', conn.srvHost);
    }
    if (conn.dbName) {
      console.log('🗄️  Database Name:', conn.dbName);
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO Events
io.on('connection', socket => {
  console.log('🔌 New client connected');
  socket.on('join', userId => socket.join(userId));
  socket.on('bookingUpdate', data => io.to(data.userId).emit('bookingUpdated', data));
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// Authentication Middleware
function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user || decoded; // Adjust to structure used in token
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Item Routes
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

  try {
    const newItem = new Item({ name, description });
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
    if (!item) return res.status(404).json({ message: 'Item not found' });

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

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/care-seekers', careSeekerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', careNeedsRoutes);
app.use('/api/match-caregivers', matchingRoutes);

// Basic route for homepage
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Static file handling for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  
  // Check email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email notifications disabled - EMAIL_USER and EMAIL_PASS not configured');
    console.log('📧 To enable email notifications, create a .env file with:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
  } else {
    console.log('✅ Email notifications enabled');
  }
});
