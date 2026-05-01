import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, STATUS, PRIORITY, fmt, isOverdue, Btn, Modal, Input, Select, Spinner, Empty, Toast } from '../components/UI';
import api from '../api/axios';

const COLS = ['todo', 'in-progress', 'done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState('');
  const [modal, setModal]     = useState(null); // 'add' | taskObj
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ title:'', description:'', assignee:'', priority:'medium', dueDate: new Date().toISOString().split('T')[0] });
  const [formErr, setFormErr] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project=${id}`),
      api.get('/users')
    ]).then(([p, t, u]) => {
      setProject(p.data.project);
      setTasks(t.data.tasks);
      setUsers(u.data.users);
      if (p.data.project.members?.length > 0) {
        setForm(f => ({ ...f, assignee: p.data.project.members[0]._id }));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const addTask = async () => {
    if (!form.title.trim()) { setFormErr('Title is required.'); return; }
    if (!form.assignee)     { setFormErr('Assignee is required.'); return; }
    setSaving(true); setFormErr('');
    try {
      const { data } = await api.post('/tasks', { ...form, project: id });
      setTasks(prev => [...prev, data.task]);
      setModal(null);
      setForm({ title:'', description:'', assignee: project.members[0]?._id || '', priority:'medium', dueDate: new Date().toISOString().split('T')[0] });
      showToast('Task created ✓');
    } catch(err) {
      setFormErr(err.response?.data?.message || 'Error.');
    }
    setSaving(false);
  };

  const changeStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
      showToast('Status updated ✓');
    } catch {}
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setModal(null);
      showToast('Task deleted');
    } catch {}
  };

  if (loading) return <Spinner />;
  if (!project) return <div style={{ color: '#e74c3c', padding: 32 }}>Project not found.</div>;

  const memberOptions = (project.members || []).map(m => ({ value: m._id, label: m.name }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }} onClick={() => navigate('/projects')}>
            ← Projects
          </span>
          <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800 }}>{project.name}</h1>
          {project.description && <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>{project.description}</p>}
        </div>
        {isAdmin && <Btn onClick={() => setModal('add')}>+ Add Task</Btn>}
      </div>

      {/* Members */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#aaa' }}>Team:</span>
        {project.members?.map(m => (
          <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 20, padding: '4px 12px 4px 6px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
            <Avatar user={m} size={24} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>{m.name}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {COLS.map(col => {
          const sm      = STATUS[col];
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col} style={{ background: '#f8f9fe', borderRadius: 12, padding: 16, minHeight: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Badge text={sm.label} bg={sm.bg} color={sm.color} />
                <span style={{ fontSize: 12, color: '#aaa' }}>{colTasks.length}</span>
              </div>
              {colTasks.map(t => (
                <KanbanCard
                  key={t._id} task={t} isAdmin={isAdmin} currentUser={user}
                  onStatusChange={changeStatus}
                  onClick={() => setModal(t)}
                />
              ))}
              {colTasks.length === 0 && (
                <div style={{ color: '#ccc', fontSize: 13, textAlign: 'center', marginTop: 24 }}>Empty</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {modal === 'add' && (
        <Modal title="Add Task" onClose={() => { setModal(null); setFormErr(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Task Title *" placeholder="What needs to be done?"
              value={form.title} onChange={e => set('title', e.target.value)} error={formErr} />
            <Input label="Description" placeholder="Optional details"
              value={form.description} onChange={e => set('description', e.target.value)} />
            <Select label="Assignee *" value={form.assignee} onChange={e => set('assignee', e.target.value)}
              options={memberOptions} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)}
                options={[{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]}
                style={{ flex: 1 }} />
              <Input label="Due Date *" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={{ flex: 1 }} />
            </div>
            <Btn onClick={addTask} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {saving ? 'Creating…' : 'Create Task'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Task Detail Modal */}
      {modal && typeof modal === 'object' && (
        <TaskDetailModal
          task={modal} users={users} isAdmin={isAdmin} currentUser={user}
          onClose={() => setModal(null)}
          onStatusChange={(id, s) => { changeStatus(id, s); setModal(prev => ({ ...prev, status: s })); }}
          onDelete={deleteTask}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

function KanbanCard({ task, isAdmin, currentUser, onStatusChange, onClick }) {
  const pm = PRIORITY[task.priority] || PRIORITY.medium;
  const od = isOverdue(task.dueDate, task.status);
  const canEdit = isAdmin || task.assignee?._id === currentUser?._id;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
        cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.07)',
        borderLeft: od ? '3px solid #e74c3c' : '3px solid transparent'
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{task.title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: od ? '#e74c3c' : '#aaa' }}>{fmt(task.dueDate)}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: pm.color, fontWeight: 600 }}>{pm.label}</span>
          <Avatar user={task.assignee} size={22} />
        </div>
      </div>
      {canEdit && (
        <select
          value={task.status}
          onClick={e => e.stopPropagation()}
          onChange={e => { e.stopPropagation(); onStatusChange(task._id, e.target.value); }}
          style={{ width: '100%', marginTop: 10, padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e5ef', fontSize: 12, background: '#fff', cursor: 'pointer' }}
        >
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      )}
    </div>
  );
}

function TaskDetailModal({ task, isAdmin, currentUser, onClose, onStatusChange, onDelete }) {
  const sm = STATUS[task.status] || STATUS.todo;
  const pm = PRIORITY[task.priority] || PRIORITY.medium;
  const od = isOverdue(task.dueDate, task.status);
  const canEdit = isAdmin || task.assignee?._id === currentUser?._id;

  return (
    <Modal title="Task Details" onClose={onClose}>
      <div style={{ paddingBottom: 8 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>{task.title}</h2>
        {task.description && <p style={{ color: '#555', fontSize: 13, marginBottom: 14 }}>{task.description}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Badge text={sm.label} bg={sm.bg} color={sm.color} />
          <Badge text={pm.label} bg="#fff" color={pm.color} style={{ border: `1px solid ${pm.color}33` }} />
          {od && <Badge text="Overdue" bg="#fdecea" color="#e74c3c" />}
        </div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          📅 Due: <b style={{ color: od ? '#e74c3c' : '#333' }}>{fmt(task.dueDate)}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Avatar user={task.assignee} size={36} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{task.assignee?.name}</div>
            <div style={{ fontSize: 11, color: '#888' }}>Assigned to</div>
          </div>
        </div>
        {canEdit && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Update Status</label>
            <select
              value={task.status}
              onChange={e => onStatusChange(task._id, e.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e5ef', fontSize: 13, outline: 'none', background: '#fafbff' }}
            >
              {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        )}
        {isAdmin && (
          <button
            onClick={() => onDelete(task._id)}
            style={{ background: '#fdecea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >🗑 Delete Task</button>
        )}
      </div>
    </Modal>
  );
}
