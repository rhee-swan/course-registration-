const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('⚠️  MongoDB connection error:', err.message);
    console.error('⚠️  Server will continue without database. Please install and start MongoDB.');
    // Don't exit - allow server to start without MongoDB
  }
};

module.exports = connectDB;
