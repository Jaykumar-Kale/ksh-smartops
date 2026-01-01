require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { authMiddleware } = require("./middleware/auth");
// Routes
const authRoutes = require('./routes/auth');
const operationsRoutes = require('./routes/operations');
const analyticsRoutes = require('./routes/analytics');
const forecastRoutes = require('./routes/forecast');

const app = express();

// Config
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ksh-smartops';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/operations', authMiddleware, operationsRoutes);
app.use('/analytics', authMiddleware, analyticsRoutes);
app.use('/forecast', authMiddleware, forecastRoutes);

// MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'KSH SmartOps Backend API',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});
