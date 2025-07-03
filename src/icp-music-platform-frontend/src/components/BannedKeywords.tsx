import React, { useEffect, useState } from 'react';
import { listBannedKeywords, addBannedKeyword, removeBannedKeyword } from '../services/musicService';

const BannedKeywords: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [message, setMessage] = useState<string|null>(null);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listBannedKeywords();
      setKeywords(list);
    } catch {
      setError('Failed to load keywords.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const ok = await addBannedKeyword(newKeyword.trim());
      if (ok) {
        setMessage('Keyword added.');
        setNewKeyword('');
        fetchKeywords();
      } else {
        setError('Failed to add keyword.');
      }
    } catch {
      setError('Failed to add keyword.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (kw: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const ok = await removeBannedKeyword(kw);
      if (ok) {
        setMessage('Keyword removed.');
        fetchKeywords();
      } else {
        setError('Failed to remove keyword.');
      }
    } catch {
      setError('Failed to remove keyword.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Banned Keywords (Admin)</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Add new keyword"
          value={newKeyword}
          onChange={e => setNewKeyword(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleAdd} disabled={loading || !newKeyword.trim()}>Add</button>
      </div>
      {message && <div style={{ color: 'lime', marginBottom: 8 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {keywords.map((kw, i) => (
          <li key={i} style={{ marginBottom: 8, background: '#222', padding: 8, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>{kw}</span>
            <button onClick={() => handleRemove(kw)} disabled={loading}>Remove</button>
          </li>
        ))}
      </ul>
      {keywords.length === 0 && !loading && <div>No banned keywords.</div>}
    </div>
  );
};
export default BannedKeywords; 