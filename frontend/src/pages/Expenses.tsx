import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Expense } from '../types';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: 'Rent', description: '', amount: '', expense_date: ''
  });

  const load = async () => {
    const { data } = await api.get('/expenses');
    setExpenses(data);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post('/expenses', form);
      setShowModal(false);
      setForm({ category: 'Rent', description: '', amount: '', expense_date: '' });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    load();
  };

  const inp = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Expenses</h2>
        <button onClick={() => {
          setForm({ category: 'Rent', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0] });
          setShowModal(true);
        }} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Expense</button>
      </div>

      {/* Total */}
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
        padding: 16, marginBottom: 16, display: 'flex', gap: 32
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Expenses</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#f59e0b', marginTop: 4 }}>${totalExpenses.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Records</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{expenses.length}</div>
        </div>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Date', 'Category', 'Description', 'Amount', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>
                  {new Date(e.expense_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11,
                    background: 'rgba(245,158,11,0.1)', color: '#f59e0b'
                  }}>{e.category}</span>
                </td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{e.description || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#ef4444', fontWeight: 500 }}>
                  ${Number(e.amount).toFixed(2)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => del(e.id)} style={{
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
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Add Expense</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>DATE</label>
                <input type="date" value={form.expense_date} onChange={e => inp('expense_date', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>CATEGORY</label>
                <select value={form.category} onChange={e => inp('category', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                  {['Rent','Utilities','Salaries','Marketing','Maintenance','Transport','Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>DESCRIPTION</label>
                <input type="text" value={form.description} onChange={e => inp('description', e.target.value)}
                  placeholder="Brief description..."
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>AMOUNT ($) *</label>
                <input type="number" value={form.amount} onChange={e => inp('amount', e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
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