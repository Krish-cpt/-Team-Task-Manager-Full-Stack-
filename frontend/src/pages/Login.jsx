import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '20%', left: '10%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(124,110,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '10%', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(165,148,249,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-in" style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: 'var(--accent2)', marginBottom: 6 }}>
            ⬡ TaskFlow
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sign in to your workspace</p>
        </div>

        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: 32,
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>
                Email address
              </label>
              <input
                type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg3)',
                  border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '10px 14px', background: 'var(--bg3)',
                  border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', marginTop: 8,
              background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, var(--accent), #a594f9)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text3)', fontSize: 13 }}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent2)', fontWeight: 500 }}>Create one</Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '10px 16px', background: 'var(--bg3)',
          border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text3)',
        }}>
          💡 First signup = Admin. Subsequent signups = Member.
        </div>
      </div>
    </div>
  );
}
