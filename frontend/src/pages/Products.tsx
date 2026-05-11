import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product, Category, Supplier } from '../types';

const card: React.CSSProperties = { background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 };
const btn = (color = '#38c2d1', text = '#fff'): React.CSSProperties => ({ padding: '8px 16px', background: color, color: text, border: 'none', borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: 'pointer' });

export default function Products() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers]   = useState<Supplier[]>([]);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Product | null>(null);
  const [form, setForm] = useState({ name:'', sku:'', category_id:'', supplier_id:'', cost:'', price:'', stock:'', reorder_lvl:'5', notes:'' });

  const load = async () => {
    const [p, c, s] = await Promise.all([api.get('/products'), api.get('/categories'), api.get('/suppliers')]);
    setProducts(p.data); setCategories(c.data); setSuppliers(s.data);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name:'', sku:'', category_id:'', supplier_id:'', cost:'', price:'', stock:'', reorder_lvl:'5', notes:'' }); setShowModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name:p.name, sku:p.sku||'', category_id:p.category_id||'', supplier_id:p.supplier_id||'', cost:String(p.cost), price:String(p.price), stock:String(p.stock), reorder_lvl:String(p.reorder_lvl), notes:p.notes||'' }); setShowModal(true); };

  const save = async () => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      setShowModal(false); load();
    } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`); load();
  };

  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
  const stockColor = (p: Product) => p.stock === 0 ? { bg: 'var(--danger-bg)', color: 'var(--danger)' } : p.stock <= p.reorder_lvl ? { bg: 'var(--warn-bg)', color: 'var(--warn)' } : { bg: 'var(--success-bg)', color: 'var(--success)' };

  return (
    <div>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Products</h2>
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, flex: 1 }} />
          <button onClick={openAdd} style={btn()}>+ Add Product</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Name','SKU','Category','Cost','Price','Stock','Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: .8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text)' }}>{p.name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text3)', fontSize: 12 }}>{p.sku || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{p.category || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>${Number(p.cost).toFixed(2)}</td>
                <td style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 600 }}>${Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: stockColor(p).bg, color: stockColor(p).color }}>{p.stock}</span>
                </td>
                <td style={{ padding: '10px 14px', display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(p)} style={btn('var(--bg3)', 'var(--text)')}>Edit</button>
                  <button onClick={() => del(p.id)} style={btn('var(--danger-bg)', 'var(--danger)')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...card, padding: 24, width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Name *','name','text'],['SKU','sku','text'],['Cost ($)','cost','number'],['Price ($)','price','number'],['Stock','stock','number'],['Reorder Level','reorder_lvl','number']].map(([label,field,type]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>{label}</label>
                  <input type={type} value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Category</label>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={inp}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Supplier</label>
                <select value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)} style={inp}>
                  <option value="">— None —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inp, resize: 'vertical', minHeight: 60 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={btn('var(--bg3)', 'var(--text)')}>Cancel</button>
              <button onClick={save} style={btn()}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}