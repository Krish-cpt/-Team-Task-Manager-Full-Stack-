import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? errs.map(e => e.msg).join(', ') : err.response?.data?.error || 'Signup failed');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg3)',
    border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 14, outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      <div style={{
        position: 'fixed', top: '30%', right: '15%', width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(124,110,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-in" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: 'var(--accent2)', marginBottom: 6 }}>
            ⬡ TaskFlow
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Create your account</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="jane@company.com" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Account type</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>First user is always Admin regardless</p>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', marginTop: 8,
              background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--accent), #a594f9)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text3)', fontSize: 13 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent2)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
