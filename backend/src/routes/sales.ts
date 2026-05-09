import { Router } from 'express';
import pool from '../db/tidb';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT s.*, c.name as cashier_name, cu.name as customer_name
      FROM sales s
      LEFT JOIN cashiers c ON s.cashier_id = c.id
      LEFT JOIN customers cu ON s.customer_id = cu.id
      ORDER BY s.created_at DESC
    `);
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [sale]: any = await pool.execute('SELECT * FROM sales WHERE id=?', [req.params.id]);
        const [items] = await pool.execute('SELECT * FROM sale_items WHERE sale_id=?', [req.params.id]);
        res.json({ ...sale[0], items });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { items, subtotal, discount_pct, discount_amt, total, payment_method, cash_received, change_given, customer_id } = req.body;
        const cashier_id = (req as AuthRequest).user?.id;

        // Insert sale
        const saleId = require('crypto').randomUUID();
        await conn.execute(
            `INSERT INTO sales (id, cashier_id, customer_id, subtotal, discount_pct, discount_amt, total, payment_method, cash_received, change_given)
   VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [saleId, cashier_id || null, customer_id || null, subtotal, discount_pct || 0, discount_amt || 0, total, payment_method || 'cash', cash_received || total, change_given || 0]
        );
        // Insert sale items + deduct stock
        for (const item of items) {
            await conn.execute(
                'INSERT INTO sale_items (sale_id, product_id, name, qty, price, total) VALUES (?,?,?,?,?,?)',
                [saleId, item.product_id, item.name, item.qty, item.price, item.total]
            );
            await conn.execute(
                'UPDATE products SET stock = stock - ? WHERE id=?',
                [item.qty, item.product_id]
            );
        }

        // Update customer points
        if (customer_id) {
            await conn.execute(
                'UPDATE customers SET points = points + ?, total_spent = total_spent + ? WHERE id=?',
                [Math.floor(total), total, customer_id]
            );
        }

        // Audit log
        await conn.execute(
            'INSERT INTO audit_log (cashier_name, action, details) VALUES (?,?,?)',
            [(req as AuthRequest).user?.name || 'Unknown', 'Sale Completed', `Total: $${total}`]
        );

        await conn.commit();
        res.json({ message: 'Sale completed successfully', saleId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
});

export default router;