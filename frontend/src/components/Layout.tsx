import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/pos', label: 'Point of Sale', icon: '🛒' },
    { to: '/products', label: 'Products', icon: '📦' },
    { to: '/categories', label: 'Categories', icon: '🏷️' },
    { to: '/suppliers', label: 'Suppliers', icon: '🚚' },
    { to: '/customers', label: 'Customers', icon: '👥' },
    { to: '/cashiers', label: 'Cashiers', icon: '👤' },
    { to: '/sales', label: 'Sales History', icon: '🧾' },
    { to: '/expenses', label: 'Expenses', icon: '💰' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div style={{
                width: 220, background: '#1e293b', color: '#fff',
                display: 'flex', flexDirection: 'column', flexShrink: 0
            }}>
                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: '1px solid #334155' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                        System<span style={{ color: '#22c55e' }}>Mart</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Mart Management
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                                textDecoration: 'none', fontSize: 13,
                                background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
                                color: isActive ? '#22c55e' : '#94a3b8',
                            })}
                        >
                            <span>{link.icon}</span>
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div style={{
                    padding: '12px 16px', borderTop: '1px solid #334155',
                    fontSize: 12, color: '#64748b'
                }}>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{user?.name}</div>
                    <div style={{ marginBottom: 8 }}>{user?.role}</div>
                    <button onClick={handleLogout} style={{
                        width: '100%', padding: '6px', background: '#ef4444',
                        color: '#fff', border: 'none', borderRadius: 6, fontSize: 12
                    }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#0f172a', color: '#e2e8f0' }}>
                {children}
            </div>
        </div>
    );
}