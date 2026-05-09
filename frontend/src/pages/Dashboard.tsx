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

const s = {
  card: { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' } as React.CSSProperties,
  metric: { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: 16 } as React.CSSProperties,
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ color: 'var(--danger)', padding: 40, textAlign: 'center' }}>Failed to load</div>;

  const maxQty = data.topProducts[0]?.total_qty || 1;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Dashboard</h2>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent), var(--blue))',
        borderRadius: 14, padding: '20px 24px', marginBottom: 20, color: '#fff'
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Welcome back! 👋</div>
        <div style={{ fontSize: 13, opacity: .85 }}>Here's what's happening in your mart today.</div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue',  val: '$'+Number(data.totalRevenue).toFixed(2),  color: 'var(--accent)' },
          { label: 'Total Expenses', val: '$'+Number(data.totalExpenses).toFixed(2), color: 'var(--warn)' },
          { label: 'Net Profit',     val: '$'+Number(data.netProfit).toFixed(2),     color: data.netProfit>=0?'var(--accent)':'var(--danger)' },
          { label: 'Total Sales',    val: String(data.totalSales),                   color: 'var(--blue)' },
          { label: 'Low Stock',      val: String(data.lowStockCount),                color: 'var(--warn)' },
          { label: 'Out of Stock',   val: String(data.outOfStockCount),              color: 'var(--danger)' },
        ].map(m => (
          <div key={m.label} style={s.metric}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Products */}
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Top Products</div>
          {data.topProducts.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No sales yet</div>
            : data.topProducts.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ minWidth: 110, fontSize: 12, color: 'var(--text2)' }}>{p.name}</span>
                <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(p.total_qty/maxQty*100)}%`, background: 'var(--accent)', height: '100%', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, minWidth: 30, textAlign: 'right', color: 'var(--text)' }}>{p.total_qty}</span>
              </div>
            ))
          }
        </div>

        {/* Recent Sales */}
        <div style={{ ...s.card, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Recent Sales</div>
          {data.recentSales.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No sales yet</div>
            : data.recentSales.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.cashier_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(s.created_at).toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>${Number(s.total).toFixed(2)}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}