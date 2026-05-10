import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Supplier } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name:'', contact:'', phone:'', email:'', address:'', payment_terms:'Net 30' });

  const load = async () => { const { data } = await api.get('/suppliers'); setSuppliers(data); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name:'', contact:'', phone:'', email:'', address:'', payment_terms:'Net 30' }); setShowModal(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name:s.name, contact:s.contact, phone:s.phone, email:s.email, address:s.address, payment_terms:s.payment_terms }); setShowModal(true); };

  const save = async () => {
    try {
      if (editing) await api.put(`/suppliers/${editing.id}`, form);
      else await api.post('/suppliers', form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/suppliers/${id}`); load();
  };

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Suppliers</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>All Suppliers</span>
          <button onClick={openAdd} style={btn()}>+ Add Supplier</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name','Contact','Phone','Email','Payment Terms','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{s.name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{s.contact || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{s.phone || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{s.email || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--blue-light)', color: 'var(--blue)' }}>{s.payment_terms}</span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(s)} style={btn('var(--bg3)', 'var(--text)')}>Edit</button>
                  <button onClick={() => del(s.id)} style={btn('var(--danger-bg)', 'var(--danger)')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 500 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Name *','name'],['Contact','contact'],['Phone','phone'],['Email','email'],['Address','address']].map(([label, field]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</label>
                  <input type="text" value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Payment Terms</label>
                <select value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} style={inp}>
                  {['Net 7','Net 14','Net 30','Cash on Delivery','Prepaid'].map(t => <option key={t}>{t}</option>)}
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