import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Product, Category, Supplier } from '../types';

export default function Products() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', supplier_id: '',
    cost: '', price: '', stock: '', reorder_lvl: '5', notes: ''
  });

  const load = async () => {
    const [p, c, s] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
      api.get('/suppliers'),
    ]);
    setProducts(p.data);
    setCategories(c.data);
    setSuppliers(s.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', sku: '', category_id: '', supplier_id: '', cost: '', price: '', stock: '', reorder_lvl: '5', notes: '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku || '', category_id: p.category_id || '',
      supplier_id: p.supplier_id || '', cost: String(p.cost),
      price: String(p.price), stock: String(p.stock),
      reorder_lvl: String(p.reorder_lvl), notes: p.notes || ''
    });
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editing) await api.put(`/products/${editing.id}`, form);
      else await api.post('/products', form);
      setShowModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Products</h2>
        <button onClick={openAdd} style={{
          padding: '8px 16px', background: '#22c55e', color: '#000',
          border: 'none', borderRadius: 6, fontWeight: 500
        }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input
        placeholder="Search products..."
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
              {['Name', 'SKU', 'Category', 'Cost', 'Price', 'Stock', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #334155' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>{p.sku || '—'}</td>
                <td style={{ padding: '10px 14px' }}>{p.category || '—'}</td>
                <td style={{ padding: '10px 14px' }}>${Number(p.cost).toFixed(2)}</td>
                <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 500 }}>${Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: p.stock === 0 ? 'rgba(239,68,68,0.1)' : p.stock <= p.reorder_lvl ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                    color: p.stock === 0 ? '#ef4444' : p.stock <= p.reorder_lvl ? '#f59e0b' : '#22c55e'
                  }}>{p.stock}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => openEdit(p)} style={{
                    padding: '4px 10px', marginRight: 6, background: '#334155',
                    color: '#fff', border: 'none', borderRadius: 4, fontSize: 12
                  }}>Edit</button>
                  <button onClick={() => del(p.id)} style={{
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
            background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
            padding: 24, width: 500, maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              {editing ? 'Edit Product' : 'Add Product'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Name *', field: 'name', type: 'text' },
                { label: 'SKU',    field: 'sku',  type: 'text' },
                { label: 'Cost ($)',  field: 'cost',  type: 'number' },
                { label: 'Price ($)', field: 'price', type: 'number' },
                { label: 'Stock',     field: 'stock', type: 'number' },
                { label: 'Reorder Level', field: 'reorder_lvl', type: 'number' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={e => inp(field, e.target.value)}
                    style={{
                      width: '100%', padding: '7px 10px', background: '#0f172a',
                      border: '1px solid #334155', borderRadius: 6, color: '#fff'
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Category</label>
                <select value={form.category_id} onChange={e => inp('category_id', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Supplier</label>
                <select value={form.supplier_id} onChange={e => inp('supplier_id', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff' }}>
                  <option value="">— None —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => inp('notes', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#fff', resize: 'vertical' }} />
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