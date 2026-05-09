import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [name, setName]             = useState('');

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post('/categories', { name });
      setShowModal(false);
      setName('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Categories</h2>
        <button onClick={() => { setName(''); setShowModal(true); }} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Category</button>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Name', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12,
                    background: 'rgba(6,182,212,0.1)', color: '#06b6d4'
                  }}>{c.name}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => del(c.id)} style={{
                    padding: '4px 10px', background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444', border: '1px solid #ef4444', borderRadius: 4, fontSize: 12
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 12, padding: 24, width: 360
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Add Category</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>NAME *</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Grocery, Drink..."
                style={{
                  width: '100%', padding: '8px 10px', background: '#0f172a',
                  border: '1px solid #334155', borderRadius: 6, color: '#fff'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '7px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: 6
              }}>Cancel</button>
              <button onClick={save} style={{
                padding: '7px 16px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 6, fontWeight: 500
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}