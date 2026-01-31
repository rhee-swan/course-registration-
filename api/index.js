require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Using Supabase versions
app.use('/api/auth', require('../backend/routes/auth-supabase'));
app.use('/api/courses', require('../backend/routes/courses-supabase'));
app.use('/api/enrollment', require('../backend/routes/enrollment-supabase'));

// Health check
app.get('/api', (req, res) => {
  res.json({
    message: 'Course Registration API is running with Supabase',
    status: 'ok'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// Export for Vercel
module.exports = app;
