import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggle();
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative'
    }}>
      {/* Theme toggle top right */}
      <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        {isDark ? <Moon size={14} color='var(--text2)' /> : <Sun size={14} color='var(--text2)' />}
        <div onClick={handleToggle} style={{
          width: 44, height: 24, borderRadius: 12,
          background: isDark ? 'var(--accent)' : '#CBD5E1',
          position: 'relative', cursor: 'pointer', transition: 'background .3s'
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, left: isDark ? 23 : 3,
            transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }} />
        </div>
      </div>

      <div style={{
        background: 'var(--bg2)', padding: 36, borderRadius: 16,
        width: 380, border: '1px solid var(--border)',
        boxShadow: 'var(--shadow2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
            SystemMart
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid var(--danger)',
            color: 'var(--danger)', padding: '10px 14px', borderRadius: 8,
            marginBottom: 16, fontSize: 13
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: 'var(--text3)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@systemmart.com"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'var(--text3)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px',
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8,
            fontWeight: 600, fontSize: 14,
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}