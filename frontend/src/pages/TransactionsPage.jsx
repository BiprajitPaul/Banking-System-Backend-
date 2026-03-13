import React from 'react';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import StatusAlert from '../components/StatusAlert';
import './TransactionsPage.css';

function getAccountId(account) {
  if (!account) {
    return 'N/A';
  }
  if (typeof account === 'string') {
    return account;
  }
  return account._id || 'N/A';
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [userAccountIds, setUserAccountIds] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const accountResponse = await apiClient.get('/accounts');
        const ids = (accountResponse.data?.accounts || []).map((account) => account._id);
        setUserAccountIds(ids);

        const response = await apiClient.get(`/transactions/history?page=${page}&limit=${limit}`);
        setTransactions(response.data?.data || []);
        setTotalPages(response.data?.totalPages || 1);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to fetch transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page, limit]);

  return (
    <section>
      <h2 className="page-title">Transaction History</h2>
      <p className="page-subtitle">Newest transactions are displayed first</p>

      <StatusAlert type="error" message={error} />

      {loading ? (
        <div className="center-text">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <>
          <div className="transactions-table card-panel">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Sender Account</th>
                  <th>Receiver Account</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const fromId = getAccountId(transaction.fromAccount);
                  const toId = getAccountId(transaction.toAccount);
                  const isDebit = userAccountIds.includes(fromId);
                  const senderDisplay = isDebit ? fromId : 'SYSTEM / EXTERNAL';
                  const typeLabel = isDebit ? 'DEBIT' : 'CREDIT';
                  return (
                    <tr key={transaction._id}>
                      <td>
                        <span className={`txn-type ${isDebit ? 'debit' : 'credit'}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className={isDebit ? 'amount-debit' : 'amount-credit'}>
                        ₹{Number(transaction.amount || 0).toFixed(2)}
                      </td>
                      <td>{senderDisplay}</td>
                      <td>{toId}</td>
                      <td>
                        <span className={`status-badge ${String(transaction.status || '').toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="transactions-pagination">
            <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default TransactionsPage;