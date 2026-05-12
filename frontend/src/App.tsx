import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos"       element={<POS />} />
              <Route path="/sales"     element={<SalesHistory />} />
              <Route path="/products"  element={
                <RoleGuard roles={['admin','manager']}>
                  <Products />
                </RoleGuard>
              } />
              <Route path="/categories" element={
                <RoleGuard roles={['admin','manager']}>
                  <Categories />
                </RoleGuard>
              } />
              <Route path="/suppliers" element={
                <RoleGuard roles={['admin','manager']}>
                  <Suppliers />
                </RoleGuard>
              } />
              <Route path="/customers" element={
                <RoleGuard roles={['admin','manager']}>
                  <Customers />
                </RoleGuard>
              } />
              <Route path="/cashiers" element={
                <RoleGuard roles={['admin']}>
                  <Cashiers />
                </RoleGuard>
              } />
              <Route path="/expenses" element={
                <RoleGuard roles={['admin','manager']}>
                  <Expenses />
                </RoleGuard>
              } />
              <Route path="/reports" element={
                <RoleGuard roles={['admin','manager']}>
                  <Reports />
                </RoleGuard>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}