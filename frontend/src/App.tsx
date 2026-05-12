import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Cashiers from './pages/Cashiers';
import Expenses from './pages/Expenses';
import SalesHistory from './pages/SalesHistory';
import Reports from './pages/Reports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/pos"          element={<POS />} />
              <Route path="/products"     element={<Products />} />
              <Route path="/categories"   element={<Categories />} />
              <Route path="/suppliers"    element={<Suppliers />} />
              <Route path="/customers"    element={<Customers />} />
              <Route path="/cashiers"     element={<Cashiers />} />
              <Route path="/expenses"     element={<Expenses />} />
              <Route path="/sales"        element={<SalesHistory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/"             element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}