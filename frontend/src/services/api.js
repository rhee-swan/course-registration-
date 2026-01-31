import axios from 'axios';

// Use relative path for both development and production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/auth/admin-login', data);
export const requestPasswordReset = (data) => api.post('/auth/request-password-reset', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getCurrentUser = () => api.get('/auth/me');

// Course APIs (Admin)
export const getAllCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Enrollment APIs (Student)
export const getAvailableCourses = () => api.get('/enrollment/courses');
export const enrollCourse = (courseId) => api.post(`/enrollment/enroll/${courseId}`);
export const cancelEnrollment = () => api.delete('/enrollment/cancel');
export const getMyCourse = () => api.get('/enrollment/my-course');

export default api;
