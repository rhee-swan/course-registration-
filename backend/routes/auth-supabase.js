const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

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

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'student'
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
      }
      throw error;
    }

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ message: '사용자 정보를 찾을 수 없습니다.' });
    }

    if (userData.role !== 'student') {
      return res.status(403).json({ message: '학생 계정으로 로그인해주세요.' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(400).json({ message: '사용자 정보를 찾을 수 없습니다.' });
    }

    if (userData.role !== 'admin') {
      return res.status(403).json({ message: '관리자 계정으로 로그인해주세요.' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 재설정 요청
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/password-reset`
    });

    if (error) throw error;

    res.json({ message: '패스워드 재설정 링크가 이메일로 전송되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 변경
router.post('/reset-password', async (req, res) => {
  try {
    const { newPassword, confirmPassword, access_token } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: '패스워드가 일치하지 않습니다.' });
    }

    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { accessToken: access_token }
    );

    if (error) throw error;

    res.json({ message: '패스워드가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보 조회
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: '인증에 실패했습니다.' });
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        enrolled_course:enrolled_course_id (*)
      `)
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
