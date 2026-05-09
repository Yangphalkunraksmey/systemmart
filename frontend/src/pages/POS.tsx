import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product, Customer, CartItem } from '../types';

export default function POS() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [categories, setCategories] = useState<{id:string;name:string}[]>([]);
  const [discPct, setDiscPct]     = useState(0);
  const [customDisc, setCustomDisc] = useState('');
  const [discType, setDiscType]   = useState('0');
  const [custId, setCustId]       = useState('');
  const [showCharge, setShowCharge] = useState(false);
  const [payMethod, setPayMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showReceipt, setShowReceipt]   = useState(false);
  const [lastSale, setLastSale]         = useState<any>(null);

  const load = async () => {
    const [p, c, cat] = await Promise.all([
      api.get('/products'),
      api.get('/customers'),
      api.get('/categories'),
    ]);
    setProducts(p.data);
    setCustomers(c.data);
    setCategories(cat.data);
  };

  useEffect(() => { load(); }, []);

  // Cart logic
  const addToCart = (p: Product) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product_id === p.id);
      if (existing) {
        if (existing.qty >= p.stock) return prev;
        return prev.map(i => i.product_id === p.id
          ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.price }
          : i
        );
      }
      return [...prev, { product_id: p.id, name: p.name, price: Number(p.price), qty: 1, total: Number(p.price) }];
    });
  };

  const changeQty = (id: string, d: number) => {
    setCart(prev => prev
      .map(i => i.product_id === id ? { ...i, qty: i.qty + d, total: (i.qty + d) * i.price } : i)
      .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product_id !== id));
  const clearCart = () => { setCart([]); setDiscPct(0); setDiscType('0'); setCustId(''); };

  // Totals
  const subtotal = cart.reduce((a, i) => a + i.total, 0);
  const discAmt  = subtotal * discPct / 100;
  const total    = subtotal - discAmt;
  const change   = (parseFloat(cashReceived) || 0) - total;

  const onDiscChange = (val: string) => {
    setDiscType(val);
    if (val === 'custom') { setDiscPct(0); }
    else setDiscPct(parseFloat(val) || 0);
  };

  // Complete sale
  const completeSale = async () => {
    if (payMethod === 'cash' && parseFloat(cashReceived) < total) {
      alert('Cash received is less than total!'); return;
    }
    try {
      const { data } = await api.post('/sales', {
        items: cart.map(i => ({ product_id: i.product_id, name: i.name, qty: i.qty, price: i.price, total: i.total })),
        subtotal, discount_pct: discPct, discount_amt: discAmt,
        total, payment_method: payMethod,
        cash_received: payMethod === 'cash' ? parseFloat(cashReceived) : total,
        change_given: payMethod === 'cash' ? change : 0,
        customer_id: custId || null
      });
      setLastSale({ id: data.saleId, items: cart, subtotal, discPct, discAmt, total, payMethod, cashReceived: parseFloat(cashReceived), change, custId });
      setShowCharge(false);
      setShowReceipt(true);
      clearCart();
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing sale');
    }
  };

  // Filter products
  const filtered = products.filter(p =>
    (filterCat === 'all' || p.category_id === filterCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 52px)', margin: '-24px', overflow: 'hidden' }}>

      {/* LEFT — Products */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', overflow: 'hidden' }}>

        {/* Search */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #334155' }}>
          <input
            placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '7px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid #334155', overflowX: 'auto' }}>
          {[{ id: 'all', name: 'All' }, ...categories].map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 12, whiteSpace: 'nowrap',
              background: filterCat === c.id ? '#22c55e' : '#1e293b',
              color: filterCat === c.id ? '#000' : '#94a3b8',
              cursor: 'pointer'
            }}>{c.name}</button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} style={{
                background: '#1e293b', border: `1px solid ${p.stock === 0 ? '#334155' : '#334155'}`,
                borderRadius: 10, padding: 12, textAlign: 'center',
                cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                opacity: p.stock === 0 ? 0.4 : 1,
                transition: 'all .15s'
              }}
                onMouseOver={e => { if (p.stock > 0) (e.currentTarget as HTMLDivElement).style.borderColor = '#22c55e'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#334155'; }}
              >
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>{p.category || '—'}</div>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 14, color: '#22c55e', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</div>
                <div style={{ fontSize: 10, color: p.stock === 0 ? '#ef4444' : '#64748b', marginTop: 2 }}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#1e293b' }}>

        {/* Cart header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>🛒 Current Sale</h3>
          <button onClick={clearCart} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 4, fontSize: 12 }}>Clear</button>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {cart.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: '#334155' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                <div>Tap a product to add</div>
              </div>
            : cart.map(item => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: '#0f172a', borderRadius: 6, marginBottom: 6, border: '1px solid #334155' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>${item.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => changeQty(item.product_id, -1)} style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#fff', cursor: 'pointer', fontSize: 12 }}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 12, fontWeight: 500 }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.product_id, 1)} style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #334155', background: '#1e293b', color: '#fff', cursor: 'pointer', fontSize: 12 }}>+</button>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, minWidth: 44, textAlign: 'right' }}>${item.total.toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))
          }
        </div>

        {/* Cart footer */}
        <div style={{ borderTop: '1px solid #334155', padding: '12px 14px' }}>
          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: '#64748b', minWidth: 64 }}>Discount</label>
            <select value={discType} onChange={e => onDiscChange(e.target.value)}
              style={{ flex: 1, padding: '5px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11 }}>
              <option value="0">None</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="custom">Custom…</option>
            </select>
            {discType === 'custom' && (
              <input type="number" placeholder="%" value={customDisc}
                onChange={e => { setCustomDisc(e.target.value); setDiscPct(parseFloat(e.target.value) || 0); }}
                style={{ width: 56, padding: '5px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11 }} />
            )}
          </div>

          {/* Customer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#64748b', minWidth: 64 }}>Customer</label>
            <select value={custId} onChange={e => setCustId(e.target.value)}
              style={{ flex: 1, padding: '5px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 11 }}>
              <option value="">Walk-in</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Totals */}
          <div style={{ marginBottom: 10 }}>
            {[
              { label: 'Subtotal', value: `$${subtotal.toFixed(2)}`, color: '#94a3b8' },
              { label: `Discount (${discPct}%)`, value: `-$${discAmt.toFixed(2)}`, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color, padding: '2px 0' }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, borderTop: '1px solid #334155', paddingTop: 8, marginTop: 4 }}>
              <span>Total</span><span style={{ color: '#22c55e' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Charge button */}
          <button
            disabled={cart.length === 0}
            onClick={() => { setCashReceived(''); setPayMethod('cash'); setShowCharge(true); }}
            style={{
              width: '100%', padding: 12, background: cart.length === 0 ? '#334155' : '#22c55e',
              color: cart.length === 0 ? '#64748b' : '#000', border: 'none',
              borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}>
            Charge →
          </button>
        </div>
      </div>

      {/* Charge Modal */}
      {showCharge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, width: 360 }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Collect Payment</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>PAYMENT METHOD</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>TOTAL DUE</label>
              <input readOnly value={`$${total.toFixed(2)}`}
                style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#22c55e', fontWeight: 600, fontSize: 18 }} />
            </div>
            {payMethod === 'cash' && <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>CASH RECEIVED ($)</label>
                <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>CHANGE</label>
                <input readOnly value={cashReceived ? `$${change.toFixed(2)}` : '—'}
                  style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: change >= 0 ? '#22c55e' : '#ef4444' }} />
              </div>
            </>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowCharge(false)} style={{ flex: 1, padding: '8px', background: '#334155', color: '#fff', border: 'none', borderRadius: 6 }}>Cancel</button>
              <button onClick={completeSale} style={{ flex: 1, padding: '8px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 6, fontWeight: 600 }}>Complete Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, width: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>SystemMart</h2>
              <div style={{ fontSize: 12, color: '#64748b' }}>{new Date().toLocaleString()}</div>
            </div>
            {lastSale.items.map((item: CartItem) => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #334155', fontSize: 13 }}>
                <span>{item.name} ×{item.qty}</span>
                <span>${item.total.toFixed(2)}</span>
              </div>
            ))}
            {lastSale.discPct > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: '#ef4444' }}>
                <span>Discount ({lastSale.discPct}%)</span>
                <span>-${lastSale.discAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
              <span>TOTAL</span><span>${lastSale.total.toFixed(2)}</span>
            </div>
            {lastSale.payMethod === 'cash' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                <span>Cash: ${lastSale.cashReceived.toFixed(2)}</span>
                <span>Change: ${lastSale.change.toFixed(2)}</span>
              </div>
            )}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              Thank you for shopping at SystemMart!
            </div>
            <button onClick={() => setShowReceipt(false)} style={{
              width: '100%', padding: '10px', background: '#22c55e',
              color: '#000', border: 'none', borderRadius: 6, fontWeight: 600
            }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}