import React, { useState, useEffect } from 'react';
import { getAvailableCourses, enrollCourse, getCurrentUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CourseList.css';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    loadUserData();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await getAvailableCourses();
      setCourses(response.data);
    } catch (err) {
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowConfirmDialog(true);
  };

  const handleConfirmEnroll = async () => {
    try {
      await enrollCourse(selectedCourse._id);
      alert('강의 신청이 완료되었습니다.');
      setShowConfirmDialog(false);
      setSelectedCourse(null);
      loadCourses();
      loadUserData();
    } catch (err) {
      alert(err.response?.data?.message || '강의 신청에 실패했습니다.');
      setShowConfirmDialog(false);
      setSelectedCourse(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEnrollmentOpen = (course) => {
    const now = new Date();
    return now >= new Date(course.registrationStartTime) &&
           now <= new Date(course.registrationEndTime);
  };

  const canEnroll = (course) => {
    return !user?.enrolledCourse &&
           course.enrolledStudents.length < course.maxCapacity &&
           isEnrollmentOpen(course);
  };

  const getEnrollButtonText = (course) => {
    if (user?.enrolledCourse) return '이미 신청한 강의가 있습니다';
    if (course.enrolledStudents.length >= course.maxCapacity) return '정원 마감';
    if (!isEnrollmentOpen(course)) return '신청 기간 아님';
    return '강의 신청';
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-list-container">
      <div className="user-info-section">
        <h3>내 정보</h3>
        <p><strong>이메일:</strong> {user?.email}</p>
        <p><strong>이름:</strong> {user?.name}</p>
        <button
          className="password-reset-btn"
          onClick={() => navigate('/password-reset')}
        >
          패스워드 재발급
        </button>
      </div>

      <div className="courses-section">
        <h2>강의 목록</h2>
        {courses.length === 0 ? (
          <p>등록된 강의가 없습니다.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <h3>{course.name}</h3>
                <div className="course-details">
                  <p><strong>날짜:</strong> {formatDate(course.date)}</p>
                  <p><strong>시간:</strong> {course.startTime} ~ {course.endTime}</p>
                  <p><strong>신청 인원:</strong> {course.enrolledStudents.length} / {course.maxCapacity}</p>
                  <p><strong>신청 기간:</strong></p>
                  <p className="small-text">
                    {new Date(course.registrationStartTime).toLocaleString('ko-KR')} ~
                  </p>
                  <p className="small-text">
                    {new Date(course.registrationEndTime).toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  className={`enroll-btn ${canEnroll(course) ? '' : 'disabled'}`}
                  onClick={() => handleEnrollClick(course)}
                  disabled={!canEnroll(course)}
                >
                  {getEnrollButtonText(course)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>강의 신청 확인</h3>
            <p>이 강의에 등록하시겠습니까?</p>
            <p className="course-name">{selectedCourse?.name}</p>
            <div className="dialog-buttons">
              <button className="confirm-btn" onClick={handleConfirmEnroll}>
                예
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedCourse(null);
                }}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseList;
