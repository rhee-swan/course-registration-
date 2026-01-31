import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';

// Student components
import Login from './components/Student/Login';
import Signup from './components/Student/Signup';
import CourseList from './components/Student/CourseList';
import MyEnrollment from './components/Student/MyEnrollment';
import PasswordReset from './components/Student/PasswordReset';

// Admin components
import AdminLogin from './components/Admin/AdminLogin';
import CourseManagement from './components/Admin/CourseManagement';
import CourseDetail from './components/Admin/CourseDetail';

import './App.css';

// Protected route for students
function StudentRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/admin/courses" />;
  }

  return children;
}

// Protected route for admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/admin-login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/courses" />;
  }

  return children;
}

// Home redirect
function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/courses" />;
    } else {
      return <Navigate to="/courses" />;
    }
  }

  return <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Student routes */}
              <Route
                path="/courses"
                element={
                  <StudentRoute>
                    <CourseList />
                  </StudentRoute>
                }
              />
              <Route
                path="/my-enrollment"
                element={
                  <StudentRoute>
                    <MyEnrollment />
                  </StudentRoute>
                }
              />
              <Route
                path="/password-reset"
                element={
                  <StudentRoute>
                    <PasswordReset />
                  </StudentRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/courses"
                element={
                  <AdminRoute>
                    <CourseManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/courses/:id"
                element={
                  <AdminRoute>
                    <CourseDetail />
                  </AdminRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
