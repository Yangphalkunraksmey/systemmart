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
      background: '#0f172a'
    }}>
      <div style={{
        background: '#1e293b', padding: 32, borderRadius: 12,
        width: 360, border: '1px solid #334155'
      }}>
        <h1 style={{
          textAlign: 'center', marginBottom: 6,
          fontSize: 24, fontWeight: 700, color: '#fff'
        }}>
          System<span style={{ color: '#22c55e' }}>Mart</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 24, fontSize: 13 }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            color: '#ef4444', padding: '8px 12px', borderRadius: 6,
            marginBottom: 16, fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
              EMAIL
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="admin@systemmart.com"
              style={{
                width: '100%', padding: '9px 12px', background: '#0f172a',
                border: '1px solid #334155', borderRadius: 6, color: '#fff',
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
              PASSWORD
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: '100%', padding: '9px 12px', background: '#0f172a',
                border: '1px solid #334155', borderRadius: 6, color: '#fff',
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '10px', background: '#22c55e',
            color: '#000', border: 'none', borderRadius: 6,
            fontWeight: 600, fontSize: 14
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}