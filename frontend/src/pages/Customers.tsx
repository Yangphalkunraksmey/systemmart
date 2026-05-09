import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Customer } from '../types';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', points: '0'
  });

  const load = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', points: '0' });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, points: String(c.points) });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await api.put(`/customers/${editing.id}`, form);
      else await api.post('/customers', form);
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving customer');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    await api.delete(`/customers/${id}`);
    load();
  };

  const inp = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Customers</h2>
        <button onClick={openAdd} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Customer</button>
      </div>

      <input
        placeholder="Search customers..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', marginBottom: 16,
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 6, color: '#fff'
        }}
      />

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Name', 'Phone', 'Email', 'Points', 'Total Spent', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.phone || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{c.email || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11,
                    background: 'rgba(168,85,247,0.1)', color: '#a855f7'
                  }}>{c.points} pts</span>
                </td>
                <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 500 }}>
                  ${Number(c.total_spent).toFixed(2)}
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
              {editing ? 'Edit Customer' : 'Add Customer'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Name *', field: 'name' },
                { label: 'Phone',  field: 'phone' },
                { label: 'Email',  field: 'email' },
                { label: 'Points', field: 'points' },
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