import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          수강신청 시스템
        </Link>

        <div className="navbar-menu">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/courses" className="nav-link">
                    강의 관리
                  </Link>
                  <span className="nav-user">관리자: {user.name}</span>
                </>
              ) : (
                <>
                  <Link to="/courses" className="nav-link">
                    강의 신청
                  </Link>
                  <Link to="/my-enrollment" className="nav-link">
                    신청한 강의
                  </Link>
                  <span className="nav-user">{user.name}님</span>
                </>
              )}
              <button onClick={handleLogout} className="logout-btn">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                로그인
              </Link>
              <Link to="/signup" className="nav-link">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
