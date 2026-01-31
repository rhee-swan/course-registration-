import React, { useState, useEffect } from 'react';
import { getMyCourse, cancelEnrollment } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './MyEnrollment.css';

function MyEnrollment() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyCourse();
  }, []);

  const loadMyCourse = async () => {
    try {
      const response = await getMyCourse();
      setCourse(response.data);
    } catch (err) {
      if (err.response?.status === 404 || !err.response?.data) {
        setCourse(null);
      } else {
        setError('강의 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEnrollment = async () => {
    try {
      await cancelEnrollment();
      alert('강의 신청이 취소되었습니다.');
      setShowCancelDialog(false);
      navigate('/courses');
    } catch (err) {
      alert(err.response?.data?.message || '강의 취소에 실패했습니다.');
      setShowCancelDialog(false);
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

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  if (!course) {
    return (
      <div className="my-enrollment-container">
        <h2>신청한 강의</h2>
        <p className="no-course">신청한 강의가 없습니다.</p>
        <button className="back-btn" onClick={() => navigate('/courses')}>
          강의 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="my-enrollment-container">
      <h2>신청한 강의</h2>

      <div className="course-info-box">
        <h3>{course.name}</h3>
        <div className="course-info-details">
          <p><strong>날짜:</strong> {formatDate(course.date)}</p>
          <p><strong>시간:</strong> {course.startTime} ~ {course.endTime}</p>
          <p><strong>신청 인원:</strong> {course.enrolledStudents.length} / {course.maxCapacity}</p>
        </div>
        <button
          className="cancel-enrollment-btn"
          onClick={() => setShowCancelDialog(true)}
        >
          강의 취소
        </button>
      </div>

      <div className="enrolled-students-section">
        <h3>신청한 수강생 목록</h3>
        <div className="students-list">
          {course.enrolledStudents.map((student, index) => (
            <div key={student._id} className="student-item">
              <span className="student-number">{index + 1}</span>
              <span className="student-name">{student.name}</span>
              <span className="student-email">{student.email}</span>
            </div>
          ))}
        </div>
      </div>

      {showCancelDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>강의 취소 확인</h3>
            <p>정말로 이 강의를 취소하시겠습니까?</p>
            <p className="course-name">{course.name}</p>
            <div className="dialog-buttons">
              <button className="confirm-btn" onClick={handleCancelEnrollment}>
                예
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowCancelDialog(false)}
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

export default MyEnrollment;
