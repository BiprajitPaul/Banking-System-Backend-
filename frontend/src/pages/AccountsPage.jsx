import React from 'react';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatusAlert from '../components/StatusAlert';
import './AccountsPage.css';

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/accounts');
      setAccounts(response.data?.accounts || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to fetch accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await apiClient.post('/accounts/create');
      setSuccess('Account created successfully.');
      await fetchAccounts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section>
      <div className="accounts-header">
        <div>
          <h2 className="page-title">Accounts</h2>
          <p className="page-subtitle">Manage your bank accounts</p>
        </div>
        <button onClick={handleCreateAccount} disabled={creating}>
          {creating ? 'Creating...' : 'Create Account'}
        </button>
      </div>

      <StatusAlert type="error" message={error} />
      <StatusAlert type="success" message={success} />

      {loading ? (
        <div className="center-text">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="empty-state">No accounts yet. Create your first account.</div>
      ) : (
        <div className="accounts-table card-panel">
          <table>
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td className="account-id-cell">💼 {account._id}</td>
                  <td>{account.currency}</td>
                  <td>{account.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AccountsPage;