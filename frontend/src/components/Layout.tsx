import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const links = [
  { to: '/dashboard',  label: 'Dashboard',    icon: '⊞' },
  { to: '/pos',        label: 'Point of Sale', icon: '⊡' },
  { to: '/products',   label: 'Products',      icon: '▣' },
  { to: '/categories', label: 'Categories',    icon: '◈' },
  { to: '/suppliers',  label: 'Suppliers',     icon: '◎' },
  { to: '/customers',  label: 'Customers',     icon: '◉' },
  { to: '/cashiers',   label: 'Cashiers',      icon: '◍' },
  { to: '/sales',      label: 'Sales History', icon: '◑' },
  { to: '/expenses',   label: 'Expenses',      icon: '◐' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggle();
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, boxShadow: 'var(--shadow)'
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
            SystemMart
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            Management System
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 13,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'all .15s'
            })}>
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px', background: 'var(--bg3)',
            borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            width: '100%', padding: '8px', background: 'var(--danger-bg)',
            color: 'var(--danger)', border: '1px solid var(--danger)',
            borderRadius: 8, fontSize: 12, fontWeight: 500
          }}>Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', height: 52, background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)', flexShrink: 0
        }}>
          {/* Dark mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>{isDark ? '🌙' : '☀️'}</span>
            <div
              onClick={handleToggle}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: isDark ? 'var(--accent)' : '#CBD5E1',
                position: 'relative', cursor: 'pointer', transition: 'background .3s'
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: isDark ? 23 : 3,
                transition: 'left .3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}