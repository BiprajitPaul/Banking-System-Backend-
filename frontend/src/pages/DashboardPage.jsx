import React from 'react';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusAlert from '../components/StatusAlert';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const accountsResponse = await apiClient.get('/accounts');
        const fetchedAccounts = accountsResponse.data?.accounts || [];

        const enrichedAccounts = await Promise.all(
          fetchedAccounts.map(async (account) => {
            try {
              const balanceResponse = await apiClient.get(`/accounts/balance/${account._id}`);
              return {
                ...account,
                balance: balanceResponse.data?.balance ?? 0,
              };
            } catch {
              return {
                ...account,
                balance: 0,
              };
            }
          })
        );

        setAccounts(enrichedAccounts);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <section>
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Welcome back, {user?.name || 'User'}.</p>

      <div className="dashboard-user card-panel">
        <h3>User Information</h3>
        <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>User ID:</strong> {user?._id || 'N/A'}</p>
      </div>

      <StatusAlert type="error" message={error} />

      {loading ? (
        <div className="center-text">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">No accounts found.</div>
      ) : (
        <div className="dashboard-grid">
          {accounts.map((account) => (
            <article className="dashboard-account-card" key={account._id}>
              <div className="account-head-row">
                <span className="account-icon">💳</span>
                <div>
                  <h4>Account</h4>
                  <p className="account-id">{account._id}</p>
                </div>
              </div>

              <div className="account-meta-row">
                <span>{account.currency}</span>
                <span>{account.status}</span>
              </div>

              <p className="account-balance">₹{Number(account.balance || 0).toFixed(2)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;