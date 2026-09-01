const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS - allow local dev and Vercel production
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5000',
    ];
    // Allow any *.vercel.app domain or no-origin (e.g. curl/Postman)
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supermarket-simulator';
console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI:', MONGO_URI ? 'URI is set' : 'Using default localhost');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('Full error:', err);
  });

// Import Routes
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/items.routes');
const decisionRoutes = require('./routes/decision.routes');
const dashboardRoutes = require('./routes/dashboards.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const overthinkingRoutes = require('./routes/overthinking.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/overthinking', overthinkingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('DalChaal Backend is Running');
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend is fully operational',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server only when NOT on Vercel (local dev)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel Serverless
module.exports = app;
