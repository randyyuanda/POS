import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import AppLayout from './components/AppLayout';
import CashierShell from './components/CashierShell';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Loyalty from './pages/Loyalty';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LangProvider } from './contexts/LangContext';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';

function AppRoutes() {
  const { user } = useAuth();

  // Not logged in — show login only
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Cashier — dedicated POS shell, no sidebar access
  if (user.role === 'cashier') {
    return (
      <Routes>
        <Route path="*" element={
          <CashierShell>
            <POS />
          </CashierShell>
        } />
      </Routes>
    );
  }

  // Admin / Super Admin — full layout
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/*" element={
        <AppLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  );
}

function AppWithTheme() {
  const { themeMode } = useThemeMode();

  const posTheme = {
    token: {
      colorPrimary: '#667eea',
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={posTheme}>
      <BrowserRouter>
        <LoyaltyProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LoyaltyProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AppWithTheme />
      </LangProvider>
    </ThemeProvider>
  );
}
