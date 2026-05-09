import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers ORDER BY name');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, points } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    await pool.execute(
      'INSERT INTO customers (name, phone, email, points) VALUES (?,?,?,?)',
      [name, phone || '', email || '', points || 0]
    );
    res.json({ message: 'Customer created successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, points } = req.body;
    await pool.execute(
      'UPDATE customers SET name=?, phone=?, email=?, points=? WHERE id=?',
      [name, phone || '', email || '', points || 0, req.params.id]
    );
    res.json({ message: 'Customer updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM customers WHERE id=?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;