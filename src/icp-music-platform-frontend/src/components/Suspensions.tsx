import React, { useEffect, useState } from 'react';
import { listSuspensions, liftSuspension } from '../services/musicService';

const Suspensions: React.FC = () => {
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lifting, setLifting] = useState<bigint | null>(null);

  const fetchSuspensions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listSuspensions();
      setSuspensions(data);
    } catch {
      setError('Failed to load suspensions.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchSuspensions(); }, []);

  const handleLift = async (id: bigint) => {
    setLifting(id);
    setError(''); setSuccess('');
    try {
      await liftSuspension(id);
      setSuccess('Suspension lifted.');
      fetchSuspensions();
    } catch { setError('Failed to lift suspension.'); }
    setLifting(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Suspensions</h2>
      {loading && <div>Loading suspensions...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th>
            <th>Type</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Imposed By</th>
            <th>Imposed At</th>
            <th>Duration (secs)</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suspensions.map(s => (
            <tr key={s.id.toString()} style={{ borderBottom: '1px solid #eee' }}>
              <td>{s.id.toString()}</td>
              <td>{Object.keys(s.target_type)[0]}</td>
              <td>{s.target_id}</td>
              <td>{s.reason}</td>
              <td>{Object.keys(s.status)[0]}</td>
              <td>{s.imposed_by?.toString()}</td>
              <td>{new Date(Number(s.imposed_at) * 1000).toLocaleString()}</td>
              <td>{s.duration_secs && s.duration_secs[0]}</td>
              <td>{s.notes && s.notes[0]}</td>
              <td>
                {Object.keys(s.status)[0] === 'Active' && (
                  <button onClick={() => handleLift(s.id)} disabled={lifting === s.id}>Lift</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {suspensions.length === 0 && !loading && <div>No suspensions found.</div>}
    </div>
  );
};

export default Suspensions; 