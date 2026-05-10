import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Category } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [name, setName]             = useState('');

  const load = async () => { const { data } = await api.get('/categories'); setCategories(data); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.post('/categories', { name }); setShowModal(false); setName(''); load(); }
    catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); load(); }
    catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Categories</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>All Categories</span>
          <button onClick={() => { setName(''); setShowModal(true); }} style={btn()}>+ Add Category</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name', 'Products', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'var(--accent-light)', color: 'var(--accent)' }}>{c.name}</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>—</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => del(c.id)} style={btn('var(--danger-bg)', 'var(--danger)')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 380 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Add Category</h3>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grocery, Drink..." style={{ ...inp, marginBottom: 16 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={btn('var(--bg3)', 'var(--text)')}>Cancel</button>
              <button onClick={save} style={btn()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}