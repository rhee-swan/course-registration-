const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Middleware to verify student
const verifyStudent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: '인증에 실패했습니다.' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};

// 수강 가능한 강의 목록 조회 (학생)
router.get('/courses', verifyStudent, async (req, res) => {
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

    // Transform data
    const transformedCourses = courses.map(course => ({
      ...course,
      _id: course.id,
      startTime: course.start_time,
      endTime: course.end_time,
      maxCapacity: course.max_capacity,
      registrationStartTime: course.registration_start_time,
      registrationEndTime: course.registration_end_time,
      enrolledStudents: course.course_enrollments?.map(e => e.user) || []
    }));

    res.json(transformedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 신청 (학생)
router.post('/enroll/:courseId', verifyStudent, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.userId;

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('enrolled_course_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Check 1인 1강의 제약
    if (user.enrolled_course_id) {
      return res.status(400).json({
        message: '이미 다른 강의를 신청하셨습니다. 강의는 한 번에 하나만 신청할 수 있습니다.'
      });
    }

    // Get course data
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        course_enrollments (count)
      `)
      .eq('id', courseId)
      .single();

    if (courseError) {
      return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
    }

    // Check capacity
    const enrollmentCount = course.course_enrollments[0]?.count || 0;
    if (enrollmentCount >= course.max_capacity) {
      return res.status(400).json({ message: '강의 정원이 초과되었습니다.' });
    }

    // Check registration period
    const now = new Date();
    const startTime = new Date(course.registration_start_time);
    const endTime = new Date(course.registration_end_time);

    if (now < startTime || now > endTime) {
      return res.status(400).json({ message: '강의 신청 기간이 아닙니다.' });
    }

    // Create enrollment
    const { error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId
      }]);

    if (enrollError) throw enrollError;

    // Update user's enrolled_course_id
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ enrolled_course_id: courseId })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      message: '강의 신청이 완료되었습니다.',
      course: {
        ...course,
        _id: course.id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 취소 (학생)
router.delete('/cancel', verifyStudent, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's enrolled course
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('enrolled_course_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (!user.enrolled_course_id) {
      return res.status(400).json({ message: '신청한 강의가 없습니다.' });
    }

    // Delete enrollment
    const { error: deleteError } = await supabaseAdmin
      .from('course_enrollments')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', user.enrolled_course_id);

    if (deleteError) throw deleteError;

    // Clear user's enrolled_course_id
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ enrolled_course_id: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ message: '강의 신청이 취소되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내가 신청한 강의 조회 (학생)
router.get('/my-course', verifyStudent, async (req, res) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        enrolled_course_id,
        enrolled_course:enrolled_course_id (
          *,
          course_enrollments (
            user:users (id, name, email)
          )
        )
      `)
      .eq('id', req.userId)
      .single();

    if (userError) throw userError;

    if (!user.enrolled_course) {
      return res.json(null);
    }

    // Transform data
    const course = user.enrolled_course;
    const transformedCourse = {
      ...course,
      _id: course.id,
      startTime: course.start_time,
      endTime: course.end_time,
      maxCapacity: course.max_capacity,
      registrationStartTime: course.registration_start_time,
      registrationEndTime: course.registration_end_time,
      enrolledStudents: course.course_enrollments?.map(e => e.user) || []
    };

    res.json(transformedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
