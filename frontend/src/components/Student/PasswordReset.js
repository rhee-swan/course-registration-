import React, { useState } from 'react';
import { resetPassword } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function PasswordReset() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('패스워드가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(formData);
      alert('패스워드가 성공적으로 변경되었습니다.');
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || '패스워드 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>패스워드 재설정</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>새 패스워드</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>새 패스워드 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
            className="submit-btn"
          >
            {loading ? '변경 중...' : '패스워드 변경'}
          </button>
        </form>
        <div className="auth-links">
          <button
            onClick={() => navigate('/courses')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0
            }}
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
