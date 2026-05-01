import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Btn, Modal, Input, Spinner, Empty, Toast, Avatar } from '../components/UI';
import api from '../api/axios';

const COLORS = ['#e74c3c','#3498db','#27ae60','#8e44ad','#e67e22','#16a085','#4a6cf7','#c0392b'];

export default function Projects() {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [toast, setToast]       = useState('');
  const [form, setForm]         = useState({ name: '', description: '', color: COLORS[0], memberIds: [] });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/users'),
      api.get('/tasks')
    ]).then(([p, u, t]) => {
      setProjects(p.data.projects);
      setUsers(u.data.users);
      setTasks(t.data.tasks);
    }).finally(() => setLoading(false));
  }, []);

  const createProject = async () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/projects', form);
      setProjects(p => [data.project, ...p]);
      setModal(false);
      setForm({ name: '', description: '', color: COLORS[0], memberIds: [] });
      showToast('Project created ✓');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project.');
    }
    setSaving(false);
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter(m => m !== id)
        : [...f.memberIds, id]
    }));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Projects</h1>
        {isAdmin && <Btn onClick={() => setModal(true)}>+ New Project</Btn>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
        {projects.map(p => {
          const ptasks = tasks.filter(t => t.project?._id === p._id || t.project === p._id);
          const done   = ptasks.filter(t => t.status === 'done').length;
          const pct    = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0;
          return (
            <div
              key={p._id}
              onClick={() => navigate(`/projects/${p._id}`)}
              style={{
                background: '#fff', borderRadius: 14, padding: 20, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,.06)', borderTop: `4px solid ${p.color}`,
                transition: 'transform .15s, box-shadow .15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.06)'; }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: '#777', marginBottom: 14, minHeight: 18 }}>{p.description}</div>
              <div style={{ height: 6, borderRadius: 99, background: '#eee', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: p.color, borderRadius: 99, transition: 'width .3s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}>
                <span>{done}/{ptasks.length} tasks · {pct}%</span>
                <span style={{ display: 'flex' }}>
                  {p.members?.slice(0,4).map((m, i) => (
                    <span key={m._id} style={{ marginLeft: i === 0 ? 0 : -6 }}><Avatar user={m} size={22} /></span>
                  ))}
                </span>
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <Empty text="No projects yet. Create one!" />}
      </div>

      {/* Create Project Modal */}
      {modal && (
        <Modal title="New Project" onClose={() => { setModal(false); setError(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Project Name *" placeholder="e.g. Backend API"
              value={form.name} onChange={e => set('name', e.target.value)} error={error} />
            <Input label="Description" placeholder="Short description"
              value={form.description} onChange={e => set('description', e.target.value)} />

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => set('color', c)} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: form.color === c ? '3px solid #333' : '3px solid transparent'
                  }} />
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 8 }}>Add Members</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                {users.map(u => (
                  <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: form.memberIds.includes(u._id) ? '#f0f4ff' : '#fafbff', border: '1px solid #e8eaf0' }}>
                    <input type="checkbox" checked={form.memberIds.includes(u._id)} onChange={() => toggleMember(u._id)} />
                    <Avatar user={u} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>{u.role}</span>
                  </label>
                ))}
              </div>
            </div>

            <Btn onClick={createProject} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {saving ? 'Creating…' : 'Create Project'}
            </Btn>
          </div>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  );
}
