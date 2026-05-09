import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM suppliers ORDER BY name');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, contact, phone, email, address, payment_terms } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    await pool.execute(
      'INSERT INTO suppliers (name, contact, phone, email, address, payment_terms) VALUES (?,?,?,?,?,?)',
      [name, contact || '', phone || '', email || '', address || '', payment_terms || 'Net 30']
    );
    res.json({ message: 'Supplier created successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, contact, phone, email, address, payment_terms } = req.body;
    await pool.execute(
      'UPDATE suppliers SET name=?, contact=?, phone=?, email=?, address=?, payment_terms=? WHERE id=?',
      [name, contact || '', phone || '', email || '', address || '', payment_terms || 'Net 30', req.params.id]
    );
    res.json({ message: 'Supplier updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM suppliers WHERE id=?', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;