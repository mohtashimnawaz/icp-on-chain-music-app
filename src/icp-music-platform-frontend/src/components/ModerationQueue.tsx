import React, { useEffect, useState } from 'react';
import { listModerationQueue, reviewModerationItem } from '../services/musicService';

const ModerationQueue: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewing, setReviewing] = useState<bigint | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listModerationQueue();
      setQueue(data);
    } catch {
      setError('Failed to load moderation queue.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleReview = async (id: bigint, status: any, notes?: string) => {
    setReviewing(id);
    setError(''); setSuccess('');
    try {
      await reviewModerationItem(id, status, notes);
      setSuccess('Moderation item updated.');
      fetchQueue();
    } catch { setError('Failed to update moderation item.'); }
    setReviewing(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Moderation Queue</h2>
      {loading && <div>Loading moderation queue...</div>}
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
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue.map(item => (
            <tr key={item.id.toString()} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.id.toString()}</td>
              <td>{Object.keys(item.target_type)[0]}</td>
              <td>{item.target_id}</td>
              <td>{item.reason}</td>
              <td>{Object.keys(item.status)[0]}</td>
              <td>{item.notes && item.notes[0]}</td>
              <td>
                {Object.keys(item.status)[0] === 'Pending' && (
                  <>
                    <button onClick={() => handleReview(item.id, { Approved: null })} disabled={reviewing === item.id} style={{ marginRight: 4 }}>Approve</button>
                    <button onClick={() => handleReview(item.id, { Removed: null })} disabled={reviewing === item.id} style={{ marginRight: 4 }}>Remove</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {queue.length === 0 && !loading && <div>No moderation items found.</div>}
    </div>
  );
};

export default ModerationQueue; 