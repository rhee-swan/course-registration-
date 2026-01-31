import React, { useState, useEffect } from 'react';
import { getAllCourses, deleteCourse } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './AdminCourses.css';

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setError('강의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/admin/courses/new');
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      alert('강의가 삭제되었습니다.');
      setDeleteConfirm(null);
      loadCourses();
    } catch (err) {
      alert('강의 삭제에 실패했습니다.');
      setDeleteConfirm(null);
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

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>강의 관리</h2>
        <button className="create-btn" onClick={handleCreateCourse}>
          강의 생성
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="no-courses">등록된 강의가 없습니다.</p>
      ) : (
        <div className="courses-table">
          <table>
            <thead>
              <tr>
                <th>강의 이름</th>
                <th>날짜</th>
                <th>시간</th>
                <th>신청 인원</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.name}</td>
                  <td>{formatDate(course.date)}</td>
                  <td>{course.startTime} ~ {course.endTime}</td>
                  <td>{course.enrolledStudents.length} / {course.maxCapacity}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditCourse(course._id)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteConfirm(course._id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>강의 삭제 확인</h3>
            <p>정말로 이 강의를 삭제하시겠습니까?</p>
            <div className="dialog-buttons">
              <button
                className="confirm-btn"
                onClick={() => handleDeleteCourse(deleteConfirm)}
              >
                예
              </button>
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
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

export default CourseManagement;
