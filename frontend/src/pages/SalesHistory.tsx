import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Sale } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function SalesHistory() {
  const [sales, setSales]   = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const load = async () => { const { data } = await api.get('/sales'); setSales(data); };
  useEffect(() => { load(); }, []);

  const viewDetail = async (id: string) => { const { data } = await api.get(`/sales/${id}`); setDetail(data); };

  const filtered = sales.filter(s =>
    s.cashier_name?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(s.created_at).toLocaleDateString().includes(search)
  );

  const totalRevenue = sales.reduce((a, s) => a + Number(s.total), 0);

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Sales History</h2>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', val: '$'+totalRevenue.toFixed(2), color: 'var(--accent)' },
          { label: 'Total Sales',   val: String(sales.length),        color: 'var(--blue)'   },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <input placeholder="Search by cashier or date..." value={search} onChange={e => setSearch(e.target.value)} style={inp} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Sale #','Date','Cashier','Customer','Discount','Total','Payment','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px' }}><code style={{ fontSize: 11, color: 'var(--text3)' }}>#{s.id.slice(-6).toUpperCase()}</code></td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>{new Date(s.created_at).toLocaleString()}</td>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{s.cashier_name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{s.customer_name || 'Walk-in'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {Number(s.discount_pct) > 0
                    ? <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--warn-bg)', color: 'var(--warn)' }}>{s.discount_pct}%</span>
                    : '—'}
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 600 }}>${Number(s.total).toFixed(2)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--blue-light)', color: 'var(--blue)' }}>{s.payment_method}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => viewDetail(s.id)} style={btn('var(--bg3)', 'var(--text)')}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 400 }}>
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>SystemMart</h2>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(detail.created_at).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Cashier: {detail.cashier_name || '—'}</div>
            </div>
            {detail.items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text)' }}>
                <span>{item.name} ×{item.qty}</span>
                <span>${Number(item.total).toFixed(2)}</span>
              </div>
            ))}
            {Number(detail.discount_pct) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: 'var(--danger)' }}>
                <span>Discount ({detail.discount_pct}%)</span>
                <span>-${Number(detail.discount_amt).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
              <span>TOTAL</span><span>${Number(detail.total).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
              <span>Payment: {detail.payment_method}</span>
              {detail.payment_method === 'cash' && <span>Change: ${Number(detail.change_given).toFixed(2)}</span>}
            </div>
            <button onClick={() => setDetail(null)} style={{ ...btn(), width: '100%', padding: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}