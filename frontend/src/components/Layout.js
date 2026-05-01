import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const NAV = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/projects',  icon: '📁', label: 'Projects' },
  { path: '/tasks',     icon: '📋', label: 'My Tasks' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const active    = location.pathname;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI',system-ui,sans-serif", background: '#f4f6fb' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#1a1a2e', display: 'flex',
        flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0
      }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, padding: '0 24px 28px', letterSpacing: '-0.5px' }}>
          TaskFlow
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map(({ path, icon, label }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', cursor: 'pointer', userSelect: 'none',
                fontSize: 14, borderRadius: '0 8px 8px 0', marginRight: 12,
                color: active.startsWith(path) ? '#fff' : '#9ca3b0',
                background: active.startsWith(path) ? '#2d3655' : 'transparent',
                fontWeight: active.startsWith(path) ? 600 : 400,
              }}
            >{icon} {label}</div>
          ))}

          {isAdmin && (
            <div
              onClick={() => navigate('/team')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', cursor: 'pointer', userSelect: 'none',
                fontSize: 14, borderRadius: '0 8px 8px 0', marginRight: 12,
                color: active === '/team' ? '#fff' : '#9ca3b0',
                background: active === '/team' ? '#2d3655' : 'transparent',
                fontWeight: active === '/team' ? 600 : 400,
              }}
            >👥 Team</div>
          )}
        </nav>

        {/* User info at bottom */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px', borderTop: '1px solid #2d3655'
        }}>
          <Avatar user={user} size={36} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 11, color: user?.role === 'Admin' ? '#e67e22' : '#9ca3b0' }}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}
          >↩</button>
        </div>
      </aside>

      {/* Page content */}
      <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1100, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
