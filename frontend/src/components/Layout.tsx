import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const links = [
  { to: '/dashboard',  label: 'Dashboard',     icon: '📊' },
  { to: '/pos',        label: 'Point of Sale',  icon: '🛒' },
  { to: '/products',   label: 'Products',       icon: '📦' },
  { to: '/categories', label: 'Categories',     icon: '🏷️' },
  { to: '/suppliers',  label: 'Suppliers',      icon: '🚚' },
  { to: '/customers',  label: 'Customers',      icon: '👥' },
  { to: '/cashiers',   label: 'Cashiers',       icon: '👤' },
  { to: '/sales',      label: 'Sales History',  icon: '🧾' },
  { to: '/expenses',   label: 'Expenses',       icon: '💰' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: 230, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            SystemMart
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
            Mart Management System
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', fontSize: 13,
                background: isActive ? 'var(--purple-bg)' : 'transparent',
                color: isActive ? 'var(--purple2)' : 'var(--text2)',
                borderLeft: isActive ? '2px solid var(--purple2)' : '2px solid transparent',
                transition: 'all .15s'
              })}
            >
              <span style={{ fontSize: 14 }}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', background: 'var(--bg3)',
            borderRadius: 8, border: '1px solid var(--border)',
            marginBottom: 10
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0
            }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'var(--red-bg)',
            color: 'var(--red)', border: '1px solid var(--red)',
            borderRadius: 8, fontSize: 12, fontWeight: 500
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, overflow: 'auto', padding: 24,
        background: 'var(--bg)', color: 'var(--text)'
      }}>
        {children}
      </div>
    </div>
  );
}