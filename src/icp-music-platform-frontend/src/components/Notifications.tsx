import React, { useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '../services/musicService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [marking, setMarking] = useState<bigint | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch {
      setError('Failed to load notifications.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: bigint) => {
    setMarking(id);
    setError(''); setSuccess('');
    try {
      await markNotificationRead(id);
      setSuccess('Notification marked as read.');
      fetchNotifications();
    } catch { setError('Failed to mark as read.'); }
    setMarking(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Notifications</h2>
      {loading && <div>Loading notifications...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <ul>
        {notifications.map((n, i) => (
          <li key={i} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <span style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.message}</span> <br />
            <span style={{ fontSize: 12, color: '#888' }}>{new Date(Number(n.timestamp) * 1000).toLocaleString()}</span> <br />
            {!n.read && <button onClick={() => handleMarkRead(n.id)} disabled={marking === n.id}>Mark as read</button>}
          </li>
        ))}
      </ul>
      {notifications.length === 0 && !loading && <div>No notifications found.</div>}
    </div>
  );
};

export default Notifications; 