import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Btn, Modal, Input, Select, Spinner, Empty, Toast } from '../components/UI';
import api from '../api/axios';

export default function Team() {
  const { isAdmin, user: me } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'Member' });

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const addMember = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/users', form);
      setUsers(prev => [...prev, data.user]);
      setModal(false);
      setForm({ name: '', email: '', password: '', role: 'Member' });
      showToast('Member added ✓');
    } catch(err) {
      setError(err.response?.data?.message || 'Error.');
    }
    setSaving(false);
  };

  const updateRole = async (userId, role) => {
    try {
      const { data } = await api.put(`/users/${userId}`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      showToast('Role updated ✓');
    } catch(err) {
      showToast(err.response?.data?.message || 'Error updating role.');
    }
  };

  const deactivate = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('Member removed');
    } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Team Members</h1>
          <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>{users.length} members total</p>
        </div>
        {isAdmin && <Btn onClick={() => setModal(true)}>+ Add Member</Btn>}
      </div>

      {/* Members grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {users.map(u => (
          <div key={u._id} style={{
            background: '#fff', borderRadius: 14, padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            borderTop: `3px solid ${u.color || '#4a6cf7'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar user={u} size={48} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{u.email}</div>
              </div>
            </div>

            <Badge
              text={u.role}
              bg={u.role === 'Admin' ? '#fff0e6' : '#f0f4ff'}
              color={u.role === 'Admin' ? '#e67e22' : '#4a6cf7'}
            />

            {isAdmin && u._id !== me._id && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <select
                  value={u.role}
                  onChange={e => updateRole(u._id, e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e5ef', fontSize: 12, outline: 'none', background: '#fafbff', cursor: 'pointer' }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  onClick={() => deactivate(u._id)}
                  style={{ background: '#fdecea', color: '#e74c3c', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >Remove</button>
              </div>
            )}
            {u._id === me._id && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>You</div>
            )}
          </div>
        ))}
        {users.length === 0 && <Empty text="No team members yet." />}
      </div>

      {/* Add Member Modal */}
      {modal && (
        <Modal title="Add Team Member" onClose={() => { setModal(false); setError(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Full Name *" placeholder="Priya Nair"
              value={form.name} onChange={e => set('name', e.target.value)} error={error} />
            <Input label="Email *" type="email" placeholder="priya@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Password *" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => set('password', e.target.value)} />
            <Select label="Role" value={form.role} onChange={e => set('role', e.target.value)}
              options={[{value:'Member',label:'Member'},{value:'Admin',label:'Admin'}]} />
            <Btn onClick={addMember} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {saving ? 'Adding…' : 'Add Member'}
            </Btn>
          </div>
        </Modal>
      )}
      <Toast message={toast} />
    </div>
  );
}
