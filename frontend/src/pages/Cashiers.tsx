import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Cashier } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Cashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]    = useState<Cashier | null>(null);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'cashier' });

  const load = async () => { const { data } = await api.get('/cashiers'); setCashiers(data); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name:'', email:'', password:'', role:'cashier' }); setShowModal(true); };
  const openEdit = (c: Cashier) => { setEditing(c); setForm({ name:c.name, email:c.email, password:'', role:c.role }); setShowModal(true); };

  const save = async () => {
    try {
      if (editing) await api.put(`/cashiers/${editing.id}`, form);
      else await api.post('/cashiers', form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/cashiers/${id}`); load();
  };

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  const roleColor = (role: string) =>
    role === 'admin'   ? { bg: 'var(--danger-bg)',  color: 'var(--danger)' } :
    role === 'manager' ? { bg: 'var(--warn-bg)',     color: 'var(--warn)'   } :
                         { bg: 'var(--blue-light)',  color: 'var(--blue)'   };

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Cashiers</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>All Cashiers</span>
          <button onClick={openAdd} style={btn()}>+ Add Cashier</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name','Email','Role','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cashiers.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{c.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: roleColor(c.role).bg, color: roleColor(c.role).color }}>{c.role}</span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(c)} style={btn('var(--bg3)', 'var(--text)')}>Edit</button>
                  <button onClick={() => del(c.id)} style={btn('var(--danger-bg)', 'var(--danger)')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{editing ? 'Edit Cashier' : 'Add Cashier'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>{editing ? 'New Password' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={editing ? 'Leave blank to keep' : ''} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Role</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} style={inp}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={btn('var(--bg3)', 'var(--text)')}>Cancel</button>
              <button onClick={save} style={btn()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}