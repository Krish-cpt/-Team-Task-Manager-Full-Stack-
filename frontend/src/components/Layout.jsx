import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Nav = ({ to, icon, label }) => (
  <NavLink to={to} end={to === '/'} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 8, color: isActive ? '#fff' : 'var(--text2)',
    background: isActive ? 'var(--accent-glow)' : 'transparent',
    fontWeight: isActive ? 600 : 400, fontSize: 14,
    border: `1px solid ${isActive ? 'var(--border2)' : 'transparent'}`,
    transition: 'all 0.15s',
  })}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '20px 12px',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '4px 14px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--accent2)' }}>
            ⬡ TaskFlow
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Team Task Manager</div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Nav to="/" icon="⊞" label="Dashboard" />
          <Nav to="/projects" icon="◫" label="Projects" />
          <Nav to="/tasks" icon="✓" label="All Tasks" />
        </nav>

        {/* Role badge */}
        <div style={{ padding: '8px 14px', marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: user?.role === 'admin' ? 'var(--accent2)' : 'var(--text3)',
            background: user?.role === 'admin' ? 'rgba(124,110,247,0.15)' : 'var(--bg3)',
            padding: '3px 8px', borderRadius: 20,
          }}>
            {user?.role === 'admin' ? '★ Admin' : '○ Member'}
          </span>
        </div>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderTop: '1px solid var(--border)', marginTop: 4, cursor: 'pointer', borderRadius: 8,
          position: 'relative',
        }} onClick={() => setMenuOpen(!menuOpen)}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #a594f9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          {menuOpen && (
            <div style={{
              position: 'absolute', bottom: '110%', left: 0, right: 0,
              background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, overflow: 'hidden',
            }}>
              <button onClick={handleLogout} style={{
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                color: 'var(--red)', fontSize: 13, textAlign: 'left',
              }}>Sign out</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
