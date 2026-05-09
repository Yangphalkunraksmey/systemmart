import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM cashiers ORDER BY name'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO cashiers (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hash, role || 'cashier']
    );
    res.json({ message: 'Cashier created successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await pool.execute(
      'UPDATE cashiers SET name=?, email=?, role=? WHERE id=?',
      [name, email, role, req.params.id]
    );
    res.json({ message: 'Cashier updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM cashiers WHERE id=?', [req.params.id]);
    res.json({ message: 'Cashier deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;