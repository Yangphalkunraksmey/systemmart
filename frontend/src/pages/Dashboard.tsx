import { useEffect, useState } from 'react';
import api from '../services/api';

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalSales: number;
  lowStockCount: number;
  outOfStockCount: number;
  topProducts: { name: string; total_qty: number }[];
  recentSales: { id: string; cashier_name: string; total: number; created_at: string }[];
}

const card = (label: string, value: string, color: string, icon: string) => (
  <div style={{
    background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
    padding: 16, flex: 1, minWidth: 140
  }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600, color, marginTop: 4 }}>{value}</div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#64748b' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ color: '#ef4444' }}>Failed to load dashboard</div>;

  const maxQty = data.topProducts[0]?.total_qty || 1;

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>Dashboard</h2>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {card('Total Revenue',   '$' + Number(data.totalRevenue).toFixed(2),  '#22c55e', '💵')}
        {card('Total Expenses',  '$' + Number(data.totalExpenses).toFixed(2), '#f59e0b', '💸')}
        {card('Net Profit',      '$' + Number(data.netProfit).toFixed(2),     data.netProfit >= 0 ? '#22c55e' : '#ef4444', '📈')}
        {card('Total Sales',     String(data.totalSales),                     '#3b82f6', '🧾')}
        {card('Low Stock',       String(data.lowStockCount),                  '#f59e0b', '⚠️')}
        {card('Out of Stock',    String(data.outOfStockCount),                '#ef4444', '📭')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Products */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Top Products</h3>
          {data.topProducts.length === 0 && <div style={{ color: '#64748b' }}>No sales yet</div>}
          {data.topProducts.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ minWidth: 120, fontSize: 12, color: '#94a3b8' }}>{p.name}</span>
              <div style={{ flex: 1, background: '#0f172a', borderRadius: 3, height: 14 }}>
                <div style={{
                  width: `${Math.round(p.total_qty / maxQty * 100)}%`,
                  background: '#22c55e', height: '100%', borderRadius: 3
                }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, minWidth: 40, textAlign: 'right' }}>
                {p.total_qty}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Sales */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, fontWeight: 600 }}>Recent Sales</h3>
          {data.recentSales.length === 0 && <div style={{ color: '#64748b' }}>No sales yet</div>}
          {data.recentSales.map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px solid #334155', fontSize: 13
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{s.cashier_name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {new Date(s.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ color: '#22c55e', fontWeight: 500 }}>
                ${Number(s.total).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}