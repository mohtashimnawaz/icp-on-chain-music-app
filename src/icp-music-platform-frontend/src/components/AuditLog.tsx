import React, { useEffect, useState } from 'react';
import { listAuditLog } from '../services/musicService';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAuditLog();
      setLogs(data);
    } catch {
      setError('Failed to load audit log.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Audit Log</h2>
      {loading && <div>Loading audit log...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th>
            <th>Admin</th>
            <th>Action</th>
            <th>Target Type</th>
            <th>Target ID</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id.toString()} style={{ borderBottom: '1px solid #eee' }}>
              <td>{l.id.toString()}</td>
              <td>{l.admin?.toString()}</td>
              <td>{l.action}</td>
              <td>{l.target_type}</td>
              <td>{l.target_id}</td>
              <td>{new Date(Number(l.timestamp) * 1000).toLocaleString()}</td>
              <td>{l.details && l.details[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && !loading && <div>No audit log entries found.</div>}
    </div>
  );
};

export default AuditLog; 