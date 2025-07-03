import React, { useEffect, useState } from 'react';
import { listFollowedTracks, getTrack, unfollowTrack } from '../services/musicService';

const FollowedTracks: React.FC = () => {
  const [trackIds, setTrackIds] = useState<bigint[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetchFollowed();
    // eslint-disable-next-line
  }, []);

  const fetchFollowed = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = await listFollowedTracks();
      const arr = Array.isArray(ids) ? ids : Array.from(ids);
      setTrackIds(arr);
      const trackObjs = await Promise.all(arr.map(async (id: bigint) => {
        const t = await getTrack(id);
        return t && t[0] ? t[0] : null;
      }));
      setTracks(trackObjs.filter(Boolean));
    } catch {
      setError('Failed to load followed tracks.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (trackId: bigint) => {
    setLoading(true);
    setError(null);
    try {
      await unfollowTrack(trackId);
      fetchFollowed();
    } catch {
      setError('Failed to unfollow track.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Followed Tracks</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {tracks.length === 0 && !loading ? <div>You are not following any tracks.</div> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tracks.map((track: any) => (
            <li key={track.id.toString()} style={{ marginBottom: 24, background: '#222', padding: 16, borderRadius: 8 }}>
              <div><b>{track.title}</b> (ID: {track.id.toString()})</div>
              <div>Genre: {track.genre?.[0] || 'N/A'}</div>
              <div>Contributors: {(track.contributors || []).map((c: bigint) => c.toString()).join(', ')}</div>
              <button onClick={() => handleUnfollow(track.id)} disabled={loading}>Unfollow</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default FollowedTracks; 