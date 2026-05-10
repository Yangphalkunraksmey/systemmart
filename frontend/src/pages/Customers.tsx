import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Customer } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Customer | null>(null);
  const [form, setForm] = useState({ name:'', phone:'', email:'', points:'0' });

  const load = async () => { const { data } = await api.get('/customers'); setCustomers(data); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name:'', phone:'', email:'', points:'0' }); setShowModal(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name:c.name, phone:c.phone, email:c.email, points:String(c.points) }); setShowModal(true); };

  const save = async () => {
    try {
      if (editing) await api.put(`/customers/${editing.id}`, form);
      else await api.post('/customers', form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/customers/${id}`); load();
  };

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Customers</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
          <button onClick={openAdd} style={btn()}>+ Add Customer</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name','Phone','Email','Points','Total Spent','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{c.phone || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{c.email || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>{c.points} pts</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 600 }}>${Number(c.total_spent).toFixed(2)}</td>
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
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Name *','name'],['Phone','phone'],['Email','email'],['Points','points']].map(([label, field]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</label>
                  <input type="text" value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)} style={inp} />
                </div>
              ))}
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