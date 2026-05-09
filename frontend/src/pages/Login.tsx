import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
      background: 'var(--bg)'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'var(--bg2)', padding: 36, borderRadius: 16,
        width: 380, border: '1px solid var(--border)',
        boxShadow: '0 0 40px rgba(139,92,246,0.1)', position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>SystemMart</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid var(--red)',
            color: 'var(--red)', padding: '10px 14px', borderRadius: 8,
            marginBottom: 16, fontSize: 13
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: 'var(--text3)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@systemmart.com"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--text)', fontSize: 13,
                outline: 'none', transition: 'border .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: 'var(--text3)', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg3)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--text)', fontSize: 13,
                outline: 'none', transition: 'border .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: '#fff', border: 'none', borderRadius: 8,
            fontWeight: 600, fontSize: 14, letterSpacing: '.3px',
            opacity: loading ? 0.7 : 1, transition: 'opacity .15s'
          }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}