import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product, Customer, CartItem } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function POS() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [categories, setCategories] = useState<{id:string;name:string}[]>([]);
  const [cart, setCart]             = useState<CartItem[]>([]);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('all');
  const [discPct, setDiscPct]       = useState(0);
  const [discType, setDiscType]     = useState('0');
  const [customDisc, setCustomDisc] = useState('');
  const [custId, setCustId]         = useState('');
  const [showCharge, setShowCharge] = useState(false);
  const [payMethod, setPayMethod]   = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showReceipt, setShowReceipt]   = useState(false);
  const [lastSale, setLastSale]         = useState<any>(null);

  const load = async () => {
    const [p, c, cat] = await Promise.all([api.get('/products'), api.get('/customers'), api.get('/categories')]);
    setProducts(p.data); setCustomers(c.data); setCategories(cat.data);
  };
  useEffect(() => { load(); }, []);

  const addToCart = (p: Product) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.product_id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map(i => i.product_id === p.id ? { ...i, qty: i.qty+1, total: (i.qty+1)*i.price } : i);
      }
      return [...prev, { product_id: p.id, name: p.name, price: Number(p.price), qty: 1, total: Number(p.price) }];
    });
  };

  const changeQty = (id: string, d: number) => {
    setCart(prev => prev.map(i => i.product_id === id ? { ...i, qty: i.qty+d, total: (i.qty+d)*i.price } : i).filter(i => i.qty > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product_id !== id));
  const clearCart = () => { setCart([]); setDiscPct(0); setDiscType('0'); setCustId(''); };

  const subtotal = cart.reduce((a, i) => a + i.total, 0);
  const discAmt  = subtotal * discPct / 100;
  const total    = subtotal - discAmt;
  const change   = (parseFloat(cashReceived) || 0) - total;

  const onDiscChange = (val: string) => {
    setDiscType(val);
    if (val === 'custom') setDiscPct(0);
    else setDiscPct(parseFloat(val) || 0);
  };

  const completeSale = async () => {
    if (payMethod === 'cash' && parseFloat(cashReceived) < total) { alert('Cash received is less than total!'); return; }
    try {
      const { data } = await api.post('/sales', {
        items: cart.map(i => ({ product_id: i.product_id, name: i.name, qty: i.qty, price: i.price, total: i.total })),
        subtotal, discount_pct: discPct, discount_amt: discAmt, total,
        payment_method: payMethod,
        cash_received: payMethod === 'cash' ? parseFloat(cashReceived) : total,
        change_given: payMethod === 'cash' ? change : 0,
        customer_id: custId || null
      });
      setLastSale({ id: data.saleId, items: cart, subtotal, discPct, discAmt, total, payMethod, cashReceived: parseFloat(cashReceived), change, custId });
      setShowCharge(false); setShowReceipt(true);
      clearCart(); load();
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const filtered = products.filter(p =>
    (filterCat === 'all' || p.category_id === filterCat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: 'calc(100vh - 52px)', margin: '-24px', overflow: 'hidden' }}>

      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Search */}
        <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={inp} />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', overflowX: 'auto' }}>
          {[{ id: 'all', name: 'All' }, ...categories].map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', fontSize: 12,
              whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: filterCat === c.id ? 600 : 400,
              background: filterCat === c.id ? '#38c2d1' : 'var(--bg3)',
              color: filterCat === c.id ? '#fff' : 'var(--text2)',
            }}>{c.name}</button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} style={{
                ...card, padding: 14, textAlign: 'center',
                cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                opacity: p.stock === 0 ? 0.5 : 1, transition: 'all .15s'
              }}
                onMouseOver={e => { if (p.stock > 0) (e.currentTarget as HTMLElement).style.borderColor = '#38c2d1'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>{p.category || '—'}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 15, color: '#38c2d1', fontWeight: 700 }}>${Number(p.price).toFixed(2)}</div>
                <div style={{ fontSize: 10, color: p.stock === 0 ? 'var(--danger)' : 'var(--text3)', marginTop: 4 }}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg2)', borderLeft: '1px solid var(--border)' }}>
        {/* Cart header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Current Sale</span>
          <button onClick={clearCart} style={btn('var(--danger-bg)', 'var(--danger)')}>Clear</button>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {cart.length === 0
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
                <div style={{ fontSize: 13 }}>Tap a product to add</div>
              </div>
            : cart.map(item => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, ...card, marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>${item.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => changeQty(item.product_id, -1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.product_id, 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', minWidth: 50, textAlign: 'right' }}>${item.total.toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer' }}>×</button>
              </div>
            ))
          }
        </div>

        {/* Cart footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', minWidth: 64 }}>Discount</label>
            <select value={discType} onChange={e => onDiscChange(e.target.value)} style={{ ...inp, flex: 1 }}>
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
                style={{ ...inp, width: 60 }} />
            )}
          </div>

          {/* Customer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text3)', minWidth: 64 }}>Customer</label>
            <select value={custId} onChange={e => setCustId(e.target.value)} style={{ ...inp, flex: 1 }}>
              <option value="">Walk-in</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Totals */}
          <div style={{ marginBottom: 12 }}>
            {[
              { label: 'Subtotal', val: `$${subtotal.toFixed(2)}`, color: 'var(--text2)' },
              { label: `Discount (${discPct}%)`, val: `-$${discAmt.toFixed(2)}`, color: 'var(--danger)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color, padding: '2px 0' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6 }}>
              <span>Total</span>
              <span style={{ color: '#38c2d1' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Charge button */}
          <button
            disabled={cart.length === 0}
            onClick={() => { setCashReceived(''); setPayMethod('cash'); setShowCharge(true); }}
            style={{
              width: '100%', padding: 12, border: 'none', borderRadius: 8,
              background: cart.length === 0 ? 'var(--bg3)' : '#38c2d1',
              color: cart.length === 0 ? 'var(--text3)' : '#fff',
              fontWeight: 700, fontSize: 15, cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}>
            Charge →
          </button>
        </div>
      </div>

      {/* Charge Modal */}
      {showCharge && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 360 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Collect Payment</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Payment Method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={inp}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Total Due</label>
              <input readOnly value={`$${total.toFixed(2)}`} style={{ ...inp, color: '#38c2d1', fontWeight: 700, fontSize: 18 }} />
            </div>
            {payMethod === 'cash' && <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Cash Received ($)</label>
                <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder="0.00" style={inp} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Change</label>
                <input readOnly value={cashReceived ? `$${change.toFixed(2)}` : '—'} style={{ ...inp, color: change >= 0 ? '#38c2d1' : 'var(--danger)', fontWeight: 600 }} />
              </div>
            </>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowCharge(false)} style={{ ...btn('var(--bg3)', 'var(--text)'), flex: 1 }}>Cancel</button>
              <button onClick={completeSale} style={{ ...btn(), flex: 1 }}>Complete Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#38c2d1' }}>SystemMart</h2>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date().toLocaleString()}</div>
            </div>
            {lastSale.items.map((item: CartItem) => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text)' }}>
                <span>{item.name} ×{item.qty}</span>
                <span>${item.total.toFixed(2)}</span>
              </div>
            ))}
            {lastSale.discPct > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, color: 'var(--danger)' }}>
                <span>Discount ({lastSale.discPct}%)</span>
                <span>-${lastSale.discAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 700, color: '#38c2d1' }}>
              <span>TOTAL</span><span>${lastSale.total.toFixed(2)}</span>
            </div>
            {lastSale.payMethod === 'cash' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                <span>Cash: ${lastSale.cashReceived.toFixed(2)}</span>
                <span>Change: ${lastSale.change.toFixed(2)}</span>
              </div>
            )}
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Thank you for shopping at SystemMart!</div>
            <button onClick={() => setShowReceipt(false)} style={{ ...btn(), width: '100%', padding: '10px' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}