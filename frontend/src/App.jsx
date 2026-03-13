import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import TransferPage from './pages/TransferPage';
import TransactionsPage from './pages/TransactionsPage';

function ProtectedRoute() {
  const { token, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="center-text">Checking session...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { token, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="center-text">Loading...</div>;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;