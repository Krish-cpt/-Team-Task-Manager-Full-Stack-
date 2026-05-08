import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#22c55e','#3b82f6','#f97316'];

const Modal = ({ onClose, onSave, users }) => {
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], dueDate: '', memberIds: [] });
  const [loading, setLoading] = useState(false);

  const toggle = (id) => setForm(f => ({
    ...f, memberIds: f.memberIds.includes(id) ? f.memberIds.filter(x => x !== id) : [...f.memberIds, id],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 480, padding: 32 }} className="animate-in">
        <h2 style={{ fontSize: 18, marginBottom: 24 }}>New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Project name', key: 'name', type: 'text', placeholder: 'e.g. Marketing Campaign', required: true },
            { label: 'Description', key: 'description', type: 'text', placeholder: 'Optional description' },
            { label: 'Due date', key: 'dueDate', type: 'date' },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder} required={required}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none' }} />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid #fff' : '3px solid transparent',
                  boxSizing: 'border-box',
                }} />
              ))}
            </div>
          </div>

          {users.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Add members</label>
              <div style={{ maxHeight: 160, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {users.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: form.memberIds.includes(u.id) ? 'var(--accent-glow)' : 'transparent' }}>
                    <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={() => toggle(u.id)} />
                    <span style={{ fontSize: 13 }}>{u.name} <span style={{ color: 'var(--text3)' }}>({u.role})</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontSize: 14 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 10, background: 'linear-gradient(135deg, var(--accent), #a594f9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600 }}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    api.get('/projects').then(r => setProjects(r.data.projects)).finally(() => setLoading(false));
    if (user.role === 'admin') api.get('/auth/users').then(r => setUsers(r.data.users.filter(u => u.id !== user.id)));
  };

  useEffect(load, []);

  const handleSave = async (form) => {
    await api.post('/projects', form);
    setShowModal(false);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }} className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Projects</h1>
          <p style={{ color: 'var(--text2)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} style={{
            padding: '10px 20px', background: 'linear-gradient(135deg, var(--accent), #a594f9)',
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
          }}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◫</div>
          <p>No projects yet{user.role === 'admin' ? ' — create one above' : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(p => {
            const total = p.tasks?.length || 0;
            const done = p.tasks?.filter(t => t.status === 'done').length || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const overdue = p.dueDate && isPast(parseISO(p.dueDate)) && p.status !== 'completed';

            return (
              <Link key={p.id} to={`/projects/${p.id}`} style={{
                display: 'block', background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 24, textDecoration: 'none',
                transition: 'border-color 0.15s, transform 0.15s',
                borderTop: `3px solid ${p.color || 'var(--accent)'}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 4 }}>{p.name}</h3>
                  {p.description && <p style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>}
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                    <span>{done}/{total} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: p.color || 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Member avatars */}
                  <div style={{ display: 'flex' }}>
                    {(p.members || []).slice(0, 4).map((m, i) => (
                      <div key={m.id} style={{
                        width: 26, height: 26, borderRadius: '50%', marginLeft: i ? -8 : 0,
                        background: `hsl(${m.name.charCodeAt(0) * 13 % 360}, 60%, 50%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: '#fff', border: '2px solid var(--bg2)',
                      }}>{m.name[0].toUpperCase()}</div>
                    ))}
                    {p.members?.length > 4 && <div style={{ width: 26, height: 26, borderRadius: '50%', marginLeft: -8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text3)', border: '2px solid var(--bg2)' }}>+{p.members.length - 4}</div>}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {p.dueDate && <div style={{ fontSize: 11, color: overdue ? 'var(--red)' : 'var(--text3)' }}>
                      {overdue ? '⚠ ' : ''}{format(parseISO(p.dueDate), 'MMM d, yyyy')}
                    </div>}
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, textTransform: 'uppercase',
                      background: p.status === 'active' ? 'rgba(34,197,94,0.1)' : 'var(--bg3)',
                      color: p.status === 'active' ? 'var(--green)' : 'var(--text3)',
                      border: `1px solid ${p.status === 'active' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    }}>{p.status}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleSave} users={users} />}
    </div>
  );
}
