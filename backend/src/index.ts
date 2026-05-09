import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/tidb';
import authRoutes      from './routes/auth';
import productRoutes   from './routes/products';
import categoryRoutes  from './routes/categories';
import supplierRoutes  from './routes/suppliers';
import customerRoutes  from './routes/customers';
import cashierRoutes   from './routes/cashiers';
import expenseRoutes   from './routes/expenses';
import salesRoutes     from './routes/sales';
import reportRoutes    from './routes/reports';
dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://systemmart.vercel.app'
  ]
}));
app.use(express.json());

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers',  supplierRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/cashiers',   cashierRoutes);
app.use('/api/expenses',   expenseRoutes);
app.use('/api/sales',      salesRoutes);
app.use('/api/reports',    reportRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SystemMart API is running!' });
});

pool.getConnection()
  .then(() => console.log('✅ TiDB connected successfully!'))
  .catch((err) => console.error('❌ TiDB connection failed:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});