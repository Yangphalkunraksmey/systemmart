import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Cashier } from '../types';

export default function Cashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Cashier | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'cashier'
  });

  const load = async () => {
    const { data } = await api.get('/cashiers');
    setCashiers(data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'cashier' });
    setShowModal(true);
  };

  const openEdit = (c: Cashier) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, password: '', role: c.role });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await api.put(`/cashiers/${editing.id}`, form);
      else await api.post('/cashiers', form);
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving cashier');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this cashier?')) return;
    await api.delete(`/cashiers/${id}`);
    load();
  };

  const inp = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const roleColor = (role: string) => {
    if (role === 'admin')   return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' };
    if (role === 'manager') return { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' };
    return                         { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Cashiers</h2>
        <button onClick={openAdd} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Cashier</button>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Name', 'Email', 'Role', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cashiers.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: roleColor(c.role).bg, color: roleColor(c.role).color
                  }}>{c.role}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => openEdit(c)} style={{
                    padding: '4px 10px', marginRight: 6, background: '#334155',
                    color: '#fff', border: 'none', borderRadius: 4, fontSize: 12
                  }}>Edit</button>
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
            borderRadius: 12, padding: 24, width: 400
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              {editing ? 'Edit Cashier' : 'Add Cashier'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>NAME *</label>
                <input type="text" value={form.name} onChange={e => inp('name', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>EMAIL *</label>
                <input type="email" value={form.email} onChange={e => inp('email', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                  {editing ? 'NEW PASSWORD' : 'PASSWORD *'}
                </label>
                <input type="password" value={form.password} onChange={e => inp('password', e.target.value)}
                  placeholder={editing ? 'Leave blank to keep' : ''}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>ROLE</label>
                <select value={form.role} onChange={e => inp('role', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
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