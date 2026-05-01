import React from 'react';

// ── Color palette ──────────────────────────────────────────────
export const C = {
  primary: '#4a6cf7', dark: '#1a1a2e', sidebar: '#1a1a2e',
  bg: '#f4f6fb', white: '#fff', border: '#e2e5ef',
  danger: '#e74c3c', success: '#27ae60', warn: '#e67e22',
};

export const STATUS = {
  'todo':        { label: 'To Do',       bg: '#f0f4ff', color: '#4a6cf7' },
  'in-progress': { label: 'In Progress', bg: '#fff8e6', color: '#e6a817' },
  'done':        { label: 'Done',        bg: '#edfbf3', color: '#27ae60' },
};
export const PRIORITY = {
  high:   { label: 'High',   color: '#e74c3c' },
  medium: { label: 'Medium', color: '#e67e22' },
  low:    { label: 'Low',    color: '#27ae60' },
};

// ── Avatar ─────────────────────────────────────────────────────
export function Avatar({ user, size = 32 }) {
  if (!user) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: user.color || '#888', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.35
    }}>
      {user.avatar || '?'}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ text, bg, color, style = {} }) {
  return (
    <span style={{
      background: bg, color, borderRadius: 20,
      padding: '2px 10px', fontSize: 12, fontWeight: 600,
      whiteSpace: 'nowrap', ...style
    }}>{text}</span>
  );
}

// ── Button ─────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const variants = {
    primary: { background: C.primary, color: '#fff', border: 'none' },
    danger:  { background: '#fdecea', color: C.danger, border: 'none' },
    ghost:   { background: 'transparent', color: C.primary, border: `1.5px solid ${C.primary}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant], borderRadius: 8, padding: '9px 18px',
        fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        opacity: disabled ? 0.6 : 1, ...style
      }}
    >{children}</button>
  );
}

// ── Input ──────────────────────────────────────────────────────
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{label}</label>}
      <input
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8,
          border: `1.5px solid ${error ? C.danger : C.border}`,
          fontSize: 13, outline: 'none', background: '#fafbff',
          boxSizing: 'border-box', ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: C.danger }}>{error}</span>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, options, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{label}</label>}
      <select style={{
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: `1.5px solid ${C.border}`, fontSize: 13,
        outline: 'none', background: '#fafbff', boxSizing: 'border-box', ...style
      }} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 440 }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px 28px',
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 36 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{
        width: size, height: size, border: '4px solid #e8eaf0',
        borderTop: `4px solid ${C.primary}`, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function Empty({ text = 'Nothing here yet.' }) {
  return (
    <div style={{ color: '#bbb', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
      {text}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: C.dark, color: '#fff', padding: '10px 24px', borderRadius: 30,
      fontSize: 13, fontWeight: 600, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,.2)', whiteSpace: 'nowrap'
    }}>{message}</div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
export const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
export const isOverdue = (due, status) => status !== 'done' && new Date(due) < new Date();
