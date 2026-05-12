import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  LayoutDashboard, ShoppingCart, Package, Tag,
  Truck, Users, UserCheck, Receipt, Wallet, LogOut, Sun, Moon, BarChart2
} from 'lucide-react';

const links = [
  { to: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/pos',        label: 'Point of Sale', icon: ShoppingCart    },
  { to: '/products',   label: 'Products',      icon: Package         },
  { to: '/categories', label: 'Categories',    icon: Tag             },
  { to: '/suppliers',  label: 'Suppliers',     icon: Truck           },
  { to: '/customers',  label: 'Customers',     icon: Users           },
  { to: '/cashiers',   label: 'Cashiers',      icon: UserCheck       },
  { to: '/sales',      label: 'Sales History', icon: Receipt         },
  { to: '/expenses',   label: 'Expenses',      icon: Wallet          },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
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
        width: 230,
        background: 'linear-gradient(180deg, #38c2d1 0%, #2aabb9 100%)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 20, fontWeight: 800,
            color: '#fff', letterSpacing: '-0.5px'
          }}>SystemMart</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Management System
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, marginBottom: 2,
                textDecoration: 'none', fontSize: 13,
                color: isActive ? '#1A2B3C' : 'rgba(255,255,255,0.85)',
                background: isActive ? '#fff' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                transition: 'all .15s'
              })}
              onMouseOver={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = '#fff';
                  el.style.color = '#1A2B3C';
                  el.style.fontWeight = '600';
                }
              }}
              onMouseOut={e => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = 'transparent';
                  el.style.color = 'rgba(255,255,255,0.85)';
                  el.style.fontWeight = '400';
                }
              }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 10, background: 'rgba(255,255,255,0.15)',
            borderRadius: 8, marginBottom: 8
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#38c2d1', flexShrink: 0
            }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            width: '100%', padding: '8px',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8, fontSize: 12, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', height: 52,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDark ? <Moon size={14} color='var(--text2)' /> : <Sun size={14} color='var(--text2)' />}
            <div onClick={handleToggle} style={{
              width: 44, height: 24, borderRadius: 12,
              background: isDark ? '#38c2d1' : '#CBD5E1',
              position: 'relative', cursor: 'pointer', transition: 'background .3s'
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, left: isDark ? 23 : 3,
                transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
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