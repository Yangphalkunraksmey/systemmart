import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Expense } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category:'Rent', description:'', amount:'', expense_date:'' });

  const load = async () => { const { data } = await api.get('/expenses'); setExpenses(data); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try { await api.post('/expenses', form); setShowModal(false); load(); }
    catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/expenses/${id}`); load();
  };

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Expenses</h2>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Expenses', val: '$'+totalExpenses.toFixed(2), color: 'var(--warn)' },
          { label: 'Records',        val: String(expenses.length),      color: 'var(--blue)' },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>All Expenses</span>
          <button onClick={() => { setForm({ category:'Rent', description:'', amount:'', expense_date: new Date().toISOString().split('T')[0] }); setShowModal(true); }} style={btn()}>+ Add Expense</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Date','Category','Description','Amount','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e2 => (e2.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e2 => (e2.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{new Date(e.expense_date).toLocaleDateString()}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--warn-bg)', color: 'var(--warn)' }}>{e.category}</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{e.description || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--danger)', fontWeight: 600 }}>${Number(e.amount).toFixed(2)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => del(e.id)} style={btn('var(--danger-bg)', 'var(--danger)')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Add Expense</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Date</label>
                <input type="date" value={form.expense_date} onChange={e => set('expense_date', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                  {['Rent','Utilities','Salaries','Marketing','Maintenance','Transport','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Description</label>
                <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." style={inp} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Amount ($) *</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" style={inp} />
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