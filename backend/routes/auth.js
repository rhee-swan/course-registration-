const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { email, password, passwordConfirm, name } = req.body;

    if (!email || !password || !passwordConfirm || !name) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: '패스워드가 일치하지 않습니다.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'student'
    });

    await user.save();

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인 (학생)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 패스워드를 입력해주세요.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({ message: '학생 계정으로 로그인해주세요.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 로그인
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 패스워드를 입력해주세요.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: '관리자 계정으로 로그인해주세요.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 재설정 요청 (UI용 - 실제 이메일 발송 없음)
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '해당 이메일의 사용자를 찾을 수 없습니다.' });
    }

    res.json({ message: '패스워드 재설정 링크가 이메일로 전송되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 변경
router.post('/reset-password', auth, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: '패스워드가 일치하지 않습니다.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

    res.json({ message: '패스워드가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password').populate('enrolledCourse');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
