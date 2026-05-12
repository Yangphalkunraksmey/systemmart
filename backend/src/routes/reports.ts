import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  try {
    const [totalRev]: any = await pool.execute('SELECT COALESCE(SUM(total),0) as total FROM sales');
    const [totalExp]: any = await pool.execute('SELECT COALESCE(SUM(amount),0) as total FROM expenses');
    const [totalSales]: any = await pool.execute('SELECT COUNT(*) as count FROM sales');
    const [lowStock]: any = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock <= reorder_lvl AND stock > 0');
    const [outStock]: any = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock = 0');
    const [topProducts]: any = await pool.execute(`
      SELECT si.name, SUM(si.qty) as total_qty
      FROM sale_items si
      GROUP BY si.name
      ORDER BY total_qty DESC
      LIMIT 5
    `);
    const [recentSales]: any = await pool.execute(`
      SELECT s.*, c.name as cashier_name
      FROM sales s
      LEFT JOIN cashiers c ON s.cashier_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);
    const [lowStockItems]: any = await pool.execute(`
      SELECT name, stock, reorder_lvl 
      FROM products 
      WHERE stock <= reorder_lvl 
      ORDER BY stock ASC
    `);

    res.json({
      totalRevenue:    totalRev[0].total,
      totalExpenses:   totalExp[0].total,
      netProfit:       totalRev[0].total - totalExp[0].total,
      totalSales:      totalSales[0].count,
      lowStockCount:   lowStock[0].count,
      outOfStockCount: outStock[0].count,
      topProducts,
      recentSales,
      lowStockItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;