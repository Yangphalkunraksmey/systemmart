export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  supplier_id: string;
  cost: number;
  price: number;
  stock: number;
  reorder_lvl: number;
  notes: string;
  category?: string;
  supplier?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  payment_terms: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  total_spent: number;
}

export interface Cashier {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Sale {
  id: string;
  cashier_id: string;
  cashier_name: string;
  customer_id: string;
  customer_name: string;
  subtotal: number;
  discount_pct: number;
  discount_amt: number;
  total: number;
  payment_method: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  total: number;
}