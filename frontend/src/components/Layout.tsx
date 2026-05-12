import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useWindowSize } from '../hooks/useWindowSize';
import {
  LayoutDashboard, ShoppingCart, Package, Tag,
  Truck, Users, UserCheck, Receipt, Wallet,
  LogOut, Sun, Moon, BarChart2, Bell, Menu, X
} from 'lucide-react';

const allLinks = [
  { to: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin','manager','cashier'] },
  { to: '/pos',        label: 'Point of Sale', icon: ShoppingCart,    roles: ['admin','manager','cashier'] },
  { to: '/products',   label: 'Products',      icon: Package,         roles: ['admin','manager'] },
  { to: '/categories', label: 'Categories',    icon: Tag,             roles: ['admin','manager'] },
  { to: '/suppliers',  label: 'Suppliers',     icon: Truck,           roles: ['admin','manager'] },
  { to: '/customers',  label: 'Customers',     icon: Users,           roles: ['admin','manager'] },
  { to: '/cashiers',   label: 'Cashiers',      icon: UserCheck,       roles: ['admin'] },
  { to: '/sales',      label: 'Sales History', icon: Receipt,         roles: ['admin','manager','cashier'] },
  { to: '/expenses',   label: 'Expenses',      icon: Wallet,          roles: ['admin','manager'] },
  { to: '/reports',    label: 'Reports',       icon: BarChart2,       roles: ['admin','manager'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<{name:string;stock:number;reorder_lvl:number}[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  const links = allLinks.filter(l => l.roles.includes(user?.role || ''));

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const { data } = await api.get('/products');
        const low = data.filter((p: any) => p.stock <= p.reorder_lvl);
        setLowStockCount(low.length);
        setLowStockItems(low);
      } catch (e) {}
    };
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notif]')) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [navigate]);

  const handleToggle = () => {
    toggle();
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>SystemMart</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 3, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Management System</div>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={({ isActive }) => ({
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 8, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#38c2d1', flexShrink: 0 }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{
          width: '100%', padding: '8px', background: 'rgba(255,255,255,0.15)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 8, fontSize: 12, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: 230,
        background: 'linear-gradient(180deg, #38c2d1 0%, #2aabb9 100%)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s ease'
        } : {})
      }}>
        <SidebarContent />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: isMobile ? 0 : 0 }}>

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          padding: '0 16px', height: 52,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          flexShrink: 0, gap: 12, position: 'relative'
        }}>

          {/* Hamburger on mobile */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text2)', display: 'flex', alignItems: 'center', padding: 4
            }}>
              <Menu size={22} />
            </button>
          )}

          {/* Logo on mobile topbar */}
          {isMobile && (
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
              SystemMart
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Bell */}
            <div style={{ position: 'relative' }} data-notif>
              <button onClick={() => setShowNotif(!showNotif)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
                color: 'var(--text2)', position: 'relative'
              }}>
                <Bell size={18} />
                {lowStockCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--danger)', color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{lowStockCount > 9 ? '9+' : lowStockCount}</span>
                )}
              </button>

              {showNotif && (
                <div style={{
                  position: 'absolute', top: 44, right: 0,
                  width: isMobile ? 280 : 300,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: 'var(--shadow2)', zIndex: 999, overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Stock Alerts</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lowStockCount} items</span>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {lowStockItems.length === 0
                      ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>All items well stocked!</div>
                      : lowStockItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Reorder: {item.reorder_lvl}</div>
                          </div>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: item.stock === 0 ? 'var(--danger-bg)' : 'var(--warn-bg)',
                            color: item.stock === 0 ? 'var(--danger)' : 'var(--warn)'
                          }}>
                            {item.stock === 0 ? 'Out' : item.stock + ' left'}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <button onClick={() => { setShowNotif(false); navigate('/products'); }}
                      style={{ background: 'none', border: 'none', color: '#38c2d1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      View all products →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
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
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 12 : 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}