const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// 모든 강의 조회 (관리자)
router.get('/', auth, admin, async (req, res) => {
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

// 특정 강의 조회 (관리자)
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 생성 (관리자)
router.post('/', auth, admin, async (req, res) => {
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

    const course = new Course({
      name,
      date,
      startTime,
      endTime,
      maxCapacity,
      registrationStartTime,
      registrationEndTime,
      enrolledStudents: []
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 수정 (관리자)
router.put('/:id', auth, admin, async (req, res) => {
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

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        name,
        date,
        startTime,
        endTime,
        maxCapacity,
        registrationStartTime,
        registrationEndTime,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 강의 삭제 (관리자)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: '강의를 찾을 수 없습니다.' });
    }

    // 해당 강의를 신청한 학생들의 enrolledCourse 필드 초기화
    const User = require('../models/User');
    await User.updateMany(
      { enrolledCourse: req.params.id },
      { enrolledCourse: null }
    );

    res.json({ message: '강의가 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
