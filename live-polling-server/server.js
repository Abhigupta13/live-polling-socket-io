const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const pollRoutes = require('./routes/pollRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Import database connection
const connectDB = require('./config/db');

// Import socket events
const setupSocketEvents = require('./utils/socketEvents');

// Create Express app
const app = express();
const server = http.createServer(app);

const allowedOrigins = ['*'];
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  transports: ['websocket', 'polling']
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
  

app.use(express.json());

// Pass io to all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/polls', pollRoutes);
app.use('/api/students', studentRoutes);

// Setup socket events
setupSocketEvents(io);

// Health check route
app.get('/', (req, res) => {
  res.send('Live Polling API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});