import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, STATUS, PRIORITY, fmt, isOverdue, Btn, Modal, Input, Select, Spinner, Empty, Toast } from '../components/UI';
import api from '../api/axios';

export default function MyTasks() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all'); // all | todo | in-progress | done | overdue
  const [modal, setModal]     = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({ title:'', description:'', project:'', assignee:'', priority:'medium', dueDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadTasks = () => {
    const endpoint = isAdmin ? '/tasks' : '/tasks/my';
    return api.get(endpoint).then(r => setTasks(r.data.tasks));
  };

  useEffect(() => {
    Promise.all([loadTasks(), api.get('/projects'), api.get('/users')])
      .then(([, p, u]) => {
        setProjects(p.data.projects);
        setUsers(u.data.users);
        if (p.data.projects.length) setForm(f => ({ ...f, project: p.data.projects[0]._id, assignee: user._id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const addTask = async () => {
    if (!form.title.trim()) { setFormErr('Title is required.'); return; }
    if (!form.project)      { setFormErr('Select a project.'); return; }
    setSaving(true); setFormErr('');
    try {
      const { data } = await api.post('/tasks', { ...form, assignee: isAdmin ? form.assignee : user._id });
      setTasks(prev => [...prev, data.task]);
      setAddModal(false);
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
      if (modal) setModal(prev => ({ ...prev, status }));
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

  const FILTERS = [
    { key: 'all',         label: 'All' },
    { key: 'todo',        label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done',        label: 'Done' },
    { key: 'overdue',     label: '⚠️ Overdue' },
  ];

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return isOverdue(t.dueDate, t.status);
    if (filter === 'all')     return true;
    return t.status === filter;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
        <Btn onClick={() => setAddModal(true)}>+ Add Task</Btn>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            background: filter === f.key ? '#4a6cf7' : '#fff',
            color: filter === f.key ? '#fff' : '#666',
            border: '1.5px solid ' + (filter === f.key ? '#4a6cf7' : '#e2e5ef'),
            borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>{f.label} {f.key !== 'all' ? `(${tasks.filter(t => f.key === 'overdue' ? isOverdue(t.dueDate, t.status) : t.status === f.key).length})` : `(${tasks.length})`}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(t => {
          const sm = STATUS[t.status] || STATUS.todo;
          const pm = PRIORITY[t.priority] || PRIORITY.medium;
          const od = isOverdue(t.dueDate, t.status);
          return (
            <div key={t._id}
              onClick={() => setModal(t)}
              style={{
                background: '#fff', borderRadius: 10, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                borderLeft: od ? '3px solid #e74c3c' : '3px solid transparent'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{t.project?.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Badge text={pm.label} bg="#fff" color={pm.color} style={{ border: `1px solid ${pm.color}33` }} />
                <Badge text={sm.label} bg={sm.bg} color={sm.color} />
                <span style={{ fontSize: 12, color: od ? '#e74c3c' : '#888' }}>{fmt(t.dueDate)}</span>
                <Avatar user={t.assignee} size={28} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <Empty text={`No ${filter === 'all' ? '' : filter + ' '}tasks found.`} />}
      </div>

      {/* Add Task Modal */}
      {addModal && (
        <Modal title="Create Task" onClose={() => { setAddModal(false); setFormErr(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Task Title *" placeholder="What needs to be done?"
              value={form.title} onChange={e => set('title', e.target.value)} error={formErr} />
            <Input label="Description" placeholder="Optional"
              value={form.description} onChange={e => set('description', e.target.value)} />
            <Select label="Project *" value={form.project} onChange={e => set('project', e.target.value)}
              options={projects.map(p => ({ value: p._id, label: p.name }))} />
            {isAdmin && (
              <Select label="Assignee *" value={form.assignee} onChange={e => set('assignee', e.target.value)}
                options={users.map(u => ({ value: u._id, label: u.name }))} />
            )}
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
      {modal && (
        <Modal title="Task Details" onClose={() => setModal(null)}>
          <div>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>{modal.title}</h2>
            {modal.description && <p style={{ color: '#555', fontSize: 13, marginBottom: 14 }}>{modal.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <Badge text={STATUS[modal.status]?.label} bg={STATUS[modal.status]?.bg} color={STATUS[modal.status]?.color} />
              <Badge text={PRIORITY[modal.priority]?.label} bg="#fff" color={PRIORITY[modal.priority]?.color} style={{ border: `1px solid ${PRIORITY[modal.priority]?.color}33` }} />
              {isOverdue(modal.dueDate, modal.status) && <Badge text="Overdue" bg="#fdecea" color="#e74c3c" />}
            </div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>📁 {modal.project?.name}</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
              📅 Due: <b>{fmt(modal.dueDate)}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Avatar user={modal.assignee} size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{modal.assignee?.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>Assigned to</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Update Status</label>
              <select value={modal.status} onChange={e => changeStatus(modal._id, e.target.value)}
                style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e5ef', fontSize: 13, outline: 'none', background: '#fafbff' }}>
                {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            {isAdmin && (
              <button onClick={() => deleteTask(modal._id)}
                style={{ background: '#fdecea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                🗑 Delete Task
              </button>
            )}
          </div>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  );
}
