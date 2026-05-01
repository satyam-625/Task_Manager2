import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import Team from './pages/Team';

// ── Protected route wrapper ──────────────────────────────────
function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}>
      <div style={{ width:40,height:40,border:'4px solid #e8eaf0',borderTop:'4px solid #4a6cf7',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/projects" element={
            <PrivateRoute><Projects /></PrivateRoute>
          } />
          <Route path="/projects/:id" element={
            <PrivateRoute><ProjectDetail /></PrivateRoute>
          } />
          <Route path="/tasks" element={
            <PrivateRoute><Tasks /></PrivateRoute>
          } />
          <Route path="/team" element={
            <PrivateRoute adminOnly><Team /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
