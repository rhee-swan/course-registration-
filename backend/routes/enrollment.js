const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');

// 수강 가능한 강의 목록 조회 (학생)
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('enrolledStudents', 'name email')
      .sort({ date: -1 });
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 신청 (학생)
router.post('/enroll/:courseId', auth, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 1인 1강의 제약 확인
    if (user.enrolledCourse) {
      return res.status(400).json({ message: '이미 다른 강의를 신청하셨습니다. 강의는 한 번에 하나만 신청할 수 있습니다.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
    }

    // 정원 초과 확인
    if (course.enrolledStudents.length >= course.maxCapacity) {
      return res.status(400).json({ message: '강의 정원이 초과되었습니다.' });
    }

    // 신청 기간 확인
    const now = new Date();
    if (now < course.registrationStartTime || now > course.registrationEndTime) {
      return res.status(400).json({ message: '강의 신청 기간이 아닙니다.' });
    }

    // 강의 신청 처리
    course.enrolledStudents.push(userId);
    await course.save();

    user.enrolledCourse = courseId;
    await user.save();

    res.json({ message: '강의 신청이 완료되었습니다.', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 취소 (학생)
router.delete('/cancel', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (!user.enrolledCourse) {
      return res.status(400).json({ message: '신청한 강의가 없습니다.' });
    }

    const courseId = user.enrolledCourse;
    const course = await Course.findById(courseId);

    if (course) {
      course.enrolledStudents = course.enrolledStudents.filter(
        studentId => studentId.toString() !== userId.toString()
      );
      await course.save();
    }

    user.enrolledCourse = null;
    await user.save();

    res.json({ message: '강의 신청이 취소되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내가 신청한 강의 조회 (학생)
router.get('/my-course', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'enrolledCourse',
      populate: {
        path: 'enrolledStudents',
        select: 'name email'
      }
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user.enrolledCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
