import React from 'react';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatusAlert from '../components/StatusAlert';
import './TransferPage.css';

function createIdempotencyKey() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
  });
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await apiClient.get('/accounts');
        const userAccounts = response.data?.accounts || [];
        setAccounts(userAccounts);
        if (userAccounts.length > 0) {
          setFormData((prev) => ({
            ...prev,
            fromAccount: userAccounts[0]._id,
          }));
        }
      } catch {
        setError('Failed to fetch sender accounts.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
      setError('All fields are required.');
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    const idempotencyKey = createIdempotencyKey();
    setSubmitting(true);

    try {
      const response = await apiClient.post('/transactions', {
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        amount: Number(formData.amount),
        idempotencyKey,
      });

      setSuccess(`${response.data?.message || 'Transfer successful'} (Idempotency Key: ${idempotencyKey})`);
      setFormData((prev) => ({
        ...prev,
        toAccount: '',
        amount: '',
      }));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="transfer-page">
      <h2 className="page-title">Transfer Money</h2>
      <p className="page-subtitle">Send funds between accounts securely</p>

      <StatusAlert type="error" message={error} />
      <StatusAlert type="success" message={success} />

      {loadingAccounts ? (
        <div className="center-text">Loading sender accounts...</div>
      ) : (
        <form className="transfer-form card-panel" onSubmit={handleSubmit}>
          <label>Sender Account</label>
          <select name="fromAccount" value={formData.fromAccount} onChange={handleChange}>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account._id} ({account.currency})
              </option>
            ))}
          </select>

          <label>Receiver Account ID</label>
          <input
            type="text"
            name="toAccount"
            value={formData.toAccount}
            onChange={handleChange}
            placeholder="Enter receiver account ID"
          />

          <label>Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Processing transfer...' : 'Transfer Money'}
          </button>
        </form>
      )}
    </section>
  );
}

export default TransferPage;