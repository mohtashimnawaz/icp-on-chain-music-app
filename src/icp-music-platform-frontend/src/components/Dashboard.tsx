import React, { useEffect, useState } from 'react';
import { getRoyaltyBalance, withdrawRoyalties, getPaymentHistory } from '../services/musicService';

const ARTIST_ID = 1n; // TODO: Replace with real artist/user context

const Dashboard: React.FC = () => {
  const [royalty, setRoyalty] = useState<bigint>(0n);
  const [history, setHistory] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);

  useEffect(() => {
    fetchRoyalty();
    fetchHistory();
  }, []);

  const fetchRoyalty = async () => {
    try {
      const r = await getRoyaltyBalance(ARTIST_ID);
      setRoyalty(BigInt(r));
    } catch { setRoyalty(0n); }
  };
  const fetchHistory = async () => {
    try {
      const h = await getPaymentHistory(ARTIST_ID);
      setHistory(h);
    } catch { setHistory([]); }
  };
  const handleWithdraw = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const amt = BigInt(withdrawAmount);
      const ok = await withdrawRoyalties(ARTIST_ID, amt);
      if (ok) {
        setMessage('Withdrawal successful!');
        fetchRoyalty();
        fetchHistory();
      } else {
        setMessage('Withdrawal failed.');
      }
    } catch {
      setMessage('Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard</p>
      <div style={{ marginTop: 32, background: '#222', padding: 24, borderRadius: 8 }}>
        <h3>Royalty & Payments</h3>
        <div>Current Royalty Balance: <b>{royalty.toString()}</b></div>
        <div style={{ marginTop: 16 }}>
          <input
            type="number"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleWithdraw} disabled={loading || !withdrawAmount}>Withdraw</button>
        </div>
        {message && <div style={{ color: message.includes('success') ? 'lime' : 'red', marginTop: 8 }}>{message}</div>}
        <div style={{ marginTop: 24 }}>
          <h4>Payment History</h4>
          {history.length === 0 ? <div>No payments yet.</div> : (
            <table style={{ width: '100%', background: '#111', borderRadius: 4 }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Payer</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(Number(p.timestamp) * 1000).toLocaleString()}</td>
                    <td>{p.payer?.toString?.() ?? p.payer}</td>
                    <td>{p.amount?.toString?.() ?? p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard; 