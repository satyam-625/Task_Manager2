import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'taskflow-app-production-bb1b.up.railway.app',
//   headers: { 'Content-Type': 'application/json' }
// });

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'taskmanager2-production-91e1.up.railway.app',

 // baseURL: "http://localhost:5000/api",
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('taskflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
