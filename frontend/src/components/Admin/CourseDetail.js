import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, createCourse, updateCourse } from '../../services/api';
import './AdminCourses.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewCourse = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
    registrationStartTime: '',
    registrationEndTime: ''
  });

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!isNewCourse) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const response = await getCourse(id);
      const course = response.data;

      // Format dates for input fields
      const courseDate = new Date(course.date).toISOString().split('T')[0];
      const regStartTime = new Date(course.registrationStartTime).toISOString().slice(0, 16);
      const regEndTime = new Date(course.registrationEndTime).toISOString().slice(0, 16);

      setFormData({
        name: course.name,
        date: courseDate,
        startTime: course.startTime,
        endTime: course.endTime,
        maxCapacity: course.maxCapacity,
        registrationStartTime: regStartTime,
        registrationEndTime: regEndTime
      });

      setEnrolledStudents(course.enrolledStudents || []);
    } catch (err) {
      setError('강의 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const validateForm = () => {
    const requiredFields = ['name', 'date', 'startTime', 'endTime', 'maxCapacity', 'registrationStartTime', 'registrationEndTime'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      return '비어있는 항목이 있습니다';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validateForm();
    if (validation) {
      setValidationError(validation);
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        registrationStartTime: new Date(formData.registrationStartTime).toISOString(),
        registrationEndTime: new Date(formData.registrationEndTime).toISOString(),
        maxCapacity: Number(formData.maxCapacity)
      };

      if (isNewCourse) {
        await createCourse(submitData);
        alert('강의가 생성되었습니다.');
      } else {
        await updateCourse(id, submitData);
        alert('강의가 수정되었습니다.');
      }

      navigate('/admin/courses');
    } catch (err) {
      setError(err.response?.data?.message || '강의 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnyway = async () => {
    setValidationError('');
    setError('');
    setLoading(true);

    try {
      const submitData = {
        name: formData.name || '',
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        startTime: formData.startTime || '00:00',
        endTime: formData.endTime || '00:00',
        maxCapacity: Number(formData.maxCapacity) || 0,
        registrationStartTime: formData.registrationStartTime
          ? new Date(formData.registrationStartTime).toISOString()
          : new Date().toISOString(),
        registrationEndTime: formData.registrationEndTime
          ? new Date(formData.registrationEndTime).toISOString()
          : new Date().toISOString()
      };

      if (isNewCourse) {
        await createCourse(submitData);
        alert('강의가 생성되었습니다.');
      } else {
        await updateCourse(id, submitData);
        alert('강의가 수정되었습니다.');
      }

      navigate('/admin/courses');
    } catch (err) {
      setError(err.response?.data?.message || '강의 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNewCourse) return <div className="loading">로딩 중...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>{isNewCourse ? '강의 생성' : '강의 수정'}</h2>
        <button className="back-btn" onClick={() => navigate('/admin/courses')}>
          목록으로
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {validationError && (
        <div className="validation-warning">
          {validationError}
        </div>
      )}

      <div className="course-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>강의 이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>강의 날짜 *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>강의 시작 시간 *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>강의 종료 시간 *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>최대 인원 *</label>
            <input
              type="number"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>신청 시작 시간 *</label>
              <input
                type="datetime-local"
                name="registrationStartTime"
                value={formData.registrationStartTime}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>신청 종료 시간 *</label>
              <input
                type="datetime-local"
                name="registrationEndTime"
                value={formData.registrationEndTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </button>
            {validateForm() && (
              <button
                type="button"
                className="save-anyway-btn"
                onClick={handleSaveAnyway}
                disabled={loading}
              >
                그래도 저장
              </button>
            )}
          </div>
        </form>
      </div>

      {!isNewCourse && enrolledStudents.length > 0 && (
        <div className="enrolled-students-container">
          <h3>신청한 수강생 목록</h3>
          <div className="students-table">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>이름</th>
                  <th>이메일</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student, index) => (
                  <tr key={student._id}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
