import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    await pool.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    res.json({ message: 'Category created successfully' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Category already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM categories WHERE id=?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;