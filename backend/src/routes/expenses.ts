import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category, description, amount, expense_date } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount is required' });
    await pool.execute(
      'INSERT INTO expenses (category, description, amount, expense_date) VALUES (?,?,?,?)',
      [category || 'Other', description || '', amount, expense_date || new Date().toISOString().split('T')[0]]
    );
    res.json({ message: 'Expense created successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM expenses WHERE id=?', [req.params.id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;