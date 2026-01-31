const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: '인증에 실패했습니다.' });
    }

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};

// 모든 강의 조회 (관리자)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_enrollments (
          user:users (id, name, email)
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedCourses = courses.map(course => ({
      ...course,
      _id: course.id,
      enrolledStudents: course.course_enrollments?.map(e => e.user) || []
    }));

    res.json(transformedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 강의 조회 (관리자)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_enrollments (
          user:users (id, name, email)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
      }
      throw error;
    }

    // Transform data
    const transformedCourse = {
      ...course,
      _id: course.id,
      enrolledStudents: course.course_enrollments?.map(e => e.user) || []
    };

    res.json(transformedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 생성 (관리자)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      date,
      startTime,
      endTime,
      maxCapacity,
      registrationStartTime,
      registrationEndTime
    } = req.body;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert([{
        name,
        date,
        start_time: startTime,
        end_time: endTime,
        max_capacity: maxCapacity,
        registration_start_time: registrationStartTime,
        registration_end_time: registrationEndTime
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      ...course,
      _id: course.id,
      enrolledStudents: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 수정 (관리자)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      date,
      startTime,
      endTime,
      maxCapacity,
      registrationStartTime,
      registrationEndTime
    } = req.body;

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({
        name,
        date,
        start_time: startTime,
        end_time: endTime,
        max_capacity: maxCapacity,
        registration_start_time: registrationStartTime,
        registration_end_time: registrationEndTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(`
        *,
        course_enrollments (
          user:users (id, name, email)
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
      }
      throw error;
    }

    res.json({
      ...course,
      _id: course.id,
      enrolledStudents: course.course_enrollments?.map(e => e.user) || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 삭제 (관리자)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    // Delete course (cascade will handle enrollments)
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    // Clear enrolled_course_id for affected users
    await supabaseAdmin
      .from('users')
      .update({ enrolled_course_id: null })
      .eq('enrolled_course_id', req.params.id);

    res.json({ message: '강의가 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
