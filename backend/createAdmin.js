require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('관리자 계정이 이미 존재합니다.');
      console.log('이메일: admin@example.com');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      email: 'admin@example.com',
      password: hashedPassword,
      name: '관리자',
      role: 'admin',
      enrolledCourse: null
    });

    await admin.save();
    console.log('✅ 관리자 계정이 생성되었습니다!');
    console.log('이메일: admin@example.com');
    console.log('패스워드: admin123');
    console.log('\n⚠️  운영 환경에서는 반드시 패스워드를 변경하세요!');
    process.exit(0);
  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }
};

createAdmin();
