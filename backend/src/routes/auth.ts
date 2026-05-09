import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/tidb';

const router = Router();

// Register
router.post('/register', async (req, res) => {
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

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows]: any = await pool.execute(
            'SELECT * FROM cashiers WHERE email = ?', [email]
        );
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Invalid email or password' });
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );
        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role, email: user.email }
        });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const [rows]: any = await pool.execute(
            'SELECT id, name, email, role FROM cashiers WHERE id = ?', [decoded.id]
        );
        res.json(rows[0]);
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;