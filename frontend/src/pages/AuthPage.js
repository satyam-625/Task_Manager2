import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode]     = useState('login'); // 'login' | 'signup'
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup }   = useAuth();
  const navigate            = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required.'); setLoading(false); return; }
        await signup(form.name, form.email, form.password, form.role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)',
      fontFamily: "'Segoe UI',system-ui,sans-serif", padding: 16
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 44px',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 28, color: '#4a6cf7', marginBottom: 6 }}>
          TaskFlow
        </div>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 28 }}>
          Team Task Manager
        </p>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: '#f0f4ff', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, transition: 'all .15s',
                background: mode === m ? '#4a6cf7' : 'transparent',
                color: mode === m ? '#fff' : '#888'
              }}
            >{m === 'login' ? 'Login' : 'Sign Up'}</button>
          ))}
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <Field label="Full Name" placeholder="Arjun Sharma"
              value={form.name} onChange={e => set('name', e.target.value)} />
          )}
          <Field label="Email" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => set('email', e.target.value)} />
          <Field label="Password" type="password" placeholder="Min 6 characters"
            value={form.password} onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} />

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5 }}>Role</label>
              <select
                value={form.role} onChange={e => set('role', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e5ef', fontSize: 13, outline: 'none', background: '#fafbff' }}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                💡 First registered user always becomes Admin automatically.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#fdecea', color: '#c0392b', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 14 }}>
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: '100%', background: '#4a6cf7', color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 20,
            opacity: loading ? 0.7 : 1
          }}
        >{loading ? 'Please wait…' : mode === 'login' ? 'Login →' : 'Create Account →'}</button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 16 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ color: '#4a6cf7', cursor: 'pointer', fontWeight: 600 }}
          >{mode === 'login' ? 'Sign Up' : 'Login'}</span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e5ef', fontSize: 13, outline: 'none', background: '#fafbff', boxSizing: 'border-box' }}
        {...props}
      />
    </div>
  );
}
