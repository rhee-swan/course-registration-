const express = require('express');
const cors = require('cors');
const connectDB = require('../backend/config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/courses', require('../backend/routes/courses'));
app.use('/api/enrollment', require('../backend/routes/enrollment'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Course Registration API is running on Vercel' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// Export for Vercel
module.exports = app;
