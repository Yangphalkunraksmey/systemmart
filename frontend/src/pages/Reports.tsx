import { useEffect, useState } from 'react';
import api from '../services/api';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalSales: number;
  lowStockCount: number;
  outOfStockCount: number;
  topProducts: { name: string; total_qty: number }[];
  recentSales: { id: string; cashier_name: string; total: number; created_at: string }[];
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40, textAlign: 'center' }}>Loading reports...</div>;
  if (!data) return <div style={{ color: 'var(--danger)', padding: 40, textAlign: 'center' }}>Failed to load</div>;

  const maxQty = data.topProducts[0]?.total_qty || 1;
  const totalRev = Number(data.totalRevenue);
  const totalExp = Number(data.totalExpenses);
  const netProfit = Number(data.netProfit);
  const maxBar = Math.max(totalRev, totalExp, 1);
  const margin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : '0';
  const avgSale = data.totalSales > 0 ? (totalRev / data.totalSales).toFixed(2) : '0.00';

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Reports</h2>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue',  val: '$'+totalRev.toFixed(2),  color: 'var(--accent)' },
          { label: 'Total Expenses', val: '$'+totalExp.toFixed(2),  color: 'var(--warn)'   },
          { label: 'Net Profit',     val: '$'+netProfit.toFixed(2), color: netProfit>=0?'var(--accent)':'var(--danger)' },
          { label: 'Total Sales',    val: String(data.totalSales),  color: 'var(--blue)'   },
          { label: 'Profit Margin',  val: margin+'%',               color: 'var(--accent)' },
          { label: 'Avg Sale Value', val: '$'+avgSale,              color: 'var(--blue)'   },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Revenue vs Expenses Chart */}
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Revenue vs Expenses</div>
          {[
            { label: 'Revenue',  val: totalRev,  color: '#38c2d1' },
            { label: 'Expenses', val: totalExp,  color: 'var(--warn)' },
            { label: 'Profit',   val: Math.abs(netProfit), color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>${item.val.toFixed(2)}</span>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.round(item.val / maxBar * 100)}%`,
                  background: item.color, height: '100%', borderRadius: 4,
                  transition: 'width .5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top Products Chart */}
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Top Products by Sales</div>
          {data.topProducts.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No sales yet</div>
            : data.topProducts.map((p, i) => (
              <div key={p.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>#{i+1} {p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.total_qty} units</span>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(p.total_qty / maxQty * 100)}%`,
                    background: '#38c2d1', height: '100%', borderRadius: 4,
                    transition: 'width .5s ease'
                  }} />
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Recent Sales */}
        <div style={{ ...card, padding: 18 }}>
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

        {/* Stock Status */}
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Stock Status</div>
          {[
            { label: 'Low Stock Items',    val: data.lowStockCount,   color: 'var(--warn)',    bg: 'var(--warn-bg)'    },
            { label: 'Out of Stock Items', val: data.outOfStockCount, color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: item.bg, borderRadius: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: item.color, fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Total Products</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{data.lowStockCount + data.outOfStockCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}