import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, STATUS, PRIORITY, fmt, isOverdue, Spinner, Empty } from '../components/UI';
import api from '../api/axios';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks/stats/dashboard'),
      api.get('/tasks/my')
    ]).then(([s, t]) => {
      setStats(s.data.stats);
      setTasks(t.data.tasks);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const STAT_CARDS = [
    { label: 'My Tasks',    val: stats?.all || 0,        icon: '📋', color: '#4a6cf7' },
    { label: 'In Progress', val: stats?.inProgress || 0, icon: '⚡', color: '#e6a817' },
    { label: 'Completed',   val: stats?.done || 0,       icon: '✅', color: '#27ae60' },
    { label: 'Overdue',     val: stats?.overdue || 0,    icon: '🔴', color: '#e74c3c' },
  ];

  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.status));

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 14, padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)', textAlign: 'center',
            borderTop: `3px solid ${s.color}`
          }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '4px 0' }}>{s.val}</div>
            <div style={{ fontSize: 13, color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Overdue warning */}
      {overdueTasks.length > 0 && (
        <div style={{ background: '#fdecea', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: '#c0392b', fontWeight: 600, fontSize: 14 }}>
            You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}! Please update them.
          </span>
        </div>
      )}

      {/* Recent tasks */}
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#444', margin: '0 0 12px' }}>Recent Tasks</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.slice(0, 6).map(t => <TaskRow key={t._id} task={t} onClick={() => navigate('/tasks')} />)}
        {tasks.length === 0 && <Empty text="No tasks assigned to you yet." />}
      </div>
    </div>
  );
}

function TaskRow({ task, onClick }) {
  const sm = STATUS[task.status] || STATUS.todo;
  const pm = PRIORITY[task.priority] || PRIORITY.medium;
  const od = isOverdue(task.dueDate, task.status);
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 10, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        borderLeft: od ? '3px solid #e74c3c' : '3px solid transparent'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{task.title}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{task.project?.name}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Badge text={pm.label} bg="#fff" color={pm.color} style={{ border: `1px solid ${pm.color}22` }} />
        <Badge text={sm.label} bg={sm.bg} color={sm.color} />
        <span style={{ fontSize: 12, color: od ? '#e74c3c' : '#888' }}>{fmt(task.dueDate)}</span>
        <Avatar user={task.assignee} size={28} />
      </div>
    </div>
  );
}
