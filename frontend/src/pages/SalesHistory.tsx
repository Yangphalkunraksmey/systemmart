import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Sale } from '../types';

export default function SalesHistory() {
  const [sales, setSales]   = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    const { data } = await api.get('/sales');
    setSales(data);
  };

  useEffect(() => { load(); }, []);

  const viewDetail = async (id: string) => {
    const { data } = await api.get(`/sales/${id}`);
    setDetail(data);
  };

  const filtered = sales.filter(s =>
    s.cashier_name?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(s.created_at).toLocaleDateString().includes(search)
  );

  const totalRevenue = sales.reduce((a, s) => a + Number(s.total), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Sales History</h2>
      </div>

      {/* Summary */}
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
        padding: 16, marginBottom: 16, display: 'flex', gap: 32
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#22c55e', marginTop: 4 }}>${totalRevenue.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Sales</div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{sales.length}</div>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Search by cashier or date..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', marginBottom: 16,
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 6, color: '#fff'
        }}
      />

      {/* Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Sale #', 'Date', 'Cashier', 'Customer', 'Discount', 'Total', 'Payment', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px' }}>
                  <code style={{ fontSize: 11, color: '#64748b' }}>#{s.id.slice(-6).toUpperCase()}</code>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#94a3b8' }}>
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{s.cashier_name}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{s.customer_name || 'Walk-in'}</td>
                <td style={{ padding: '10px 14px' }}>
                  {Number(s.discount_pct) > 0
                    ? <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{s.discount_pct}%</span>
                    : '—'}
                </td>
                <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 500 }}>
                  ${Number(s.total).toFixed(2)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    {s.payment_method}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => viewDetail(s.id)} style={{
                    padding: '4px 10px', background: '#334155',
                    color: '#fff', border: 'none', borderRadius: 4, fontSize: 12
                  }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 12, padding: 24, width: 400
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>SystemMart</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(detail.created_at).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Cashier: {detail.cashier_name || '—'}</div>
            </div>
            {detail.items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #334155', fontSize: 13 }}>
                <span>{item.name} ×{item.qty}</span>
                <span>${Number(item.total).toFixed(2)}</span>
              </div>
            ))}
            {Number(detail.discount_pct) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#ef4444' }}>
                <span>Discount ({detail.discount_pct}%)</span>
                <span>-${Number(detail.discount_amt).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 600, color: '#22c55e' }}>
              <span>TOTAL</span>
              <span>${Number(detail.total).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              <span>Payment: {detail.payment_method}</span>
              {detail.payment_method === 'cash' && <span>Change: ${Number(detail.change_given).toFixed(2)}</span>}
            </div>
            <button onClick={() => setDetail(null)} style={{
              width: '100%', padding: '8px', background: '#22c55e',
              color: '#000', border: 'none', borderRadius: 6, fontWeight: 500
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}