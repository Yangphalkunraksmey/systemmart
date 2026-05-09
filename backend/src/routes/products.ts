import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category, s.name as supplier
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM products WHERE id = ?', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const { name, sku, category_id, supplier_id, cost, price, stock, reorder_lvl, notes } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
    await pool.execute(
      `INSERT INTO products (name, sku, category_id, supplier_id, cost, price, stock, reorder_lvl, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, sku || null, category_id || null, supplier_id || null, cost || 0, price, stock || 0, reorder_lvl || 5, notes || '']
    );
    res.json({ message: 'Product created successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'SKU already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, category_id, supplier_id, cost, price, stock, reorder_lvl, notes } = req.body;
    await pool.execute(
      `UPDATE products SET name=?, sku=?, category_id=?, supplier_id=?, cost=?, price=?, stock=?, reorder_lvl=?, notes=?
       WHERE id=?`,
      [name, sku || null, category_id || null, supplier_id || null, cost || 0, price, stock || 0, reorder_lvl || 5, notes || '', req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;