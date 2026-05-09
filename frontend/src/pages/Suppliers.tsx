import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Supplier } from '../types';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Supplier | null>(null);
  const [form, setForm] = useState({
    name: '', contact: '', phone: '', email: '', address: '', payment_terms: 'Net 30'
  });

  const load = async () => {
    const { data } = await api.get('/suppliers');
    setSuppliers(data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', contact: '', phone: '', email: '', address: '', payment_terms: 'Net 30' });
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, address: s.address, payment_terms: s.payment_terms });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await api.put(`/suppliers/${editing.id}`, form);
      else await api.post('/suppliers', form);
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving supplier');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this supplier?')) return;
    await api.delete(`/suppliers/${id}`);
    load();
  };

  const inp = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Suppliers</h2>
        <button onClick={openAdd} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Supplier</button>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Name', 'Contact', 'Phone', 'Email', 'Payment Terms', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{s.contact || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{s.phone || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{s.email || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11,
                    background: 'rgba(59,130,246,0.1)', color: '#3b82f6'
                  }}>{s.payment_terms}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => openEdit(s)} style={{
                    padding: '4px 10px', marginRight: 6, background: '#334155',
                    color: '#fff', border: 'none', borderRadius: 4, fontSize: 12
                  }}>Edit</button>
                  <button onClick={() => del(s.id)} style={{
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
            borderRadius: 12, padding: 24, width: 480
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              {editing ? 'Edit Supplier' : 'Add Supplier'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Name *',   field: 'name' },
                { label: 'Contact',  field: 'contact' },
                { label: 'Phone',    field: 'phone' },
                { label: 'Email',    field: 'email' },
                { label: 'Address',  field: 'address' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</label>
                  <input
                    type="text"
                    value={form[field as keyof typeof form]}
                    onChange={e => inp(field, e.target.value)}
                    style={{
                      width: '100%', padding: '7px 10px', background: '#0f172a',
                      border: '1px solid #334155', borderRadius: 6, color: '#fff'
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Payment Terms</label>
                <select value={form.payment_terms} onChange={e => inp('payment_terms', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                  <option>Net 7</option>
                  <option>Net 14</option>
                  <option>Net 30</option>
                  <option>Cash on Delivery</option>
                  <option>Prepaid</option>
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