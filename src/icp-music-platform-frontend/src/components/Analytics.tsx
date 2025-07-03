import React, { useEffect, useState } from 'react';
import { getPlatformAnalytics } from '../services/musicService';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPlatformAnalytics();
        setStats(data);
      } catch (e) {
        setError('Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading analytics...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!stats) return <div style={{ padding: '2rem' }}>No analytics data.</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Platform Analytics</h2>
      <ul>
        <li>Total tracks: {stats.total_tracks}</li>
        <li>Total users: {stats.total_users}</li>
        <li>Total artists: {stats.total_artists}</li>
        <li>Total plays: {stats.total_plays}</li>
        <li>Total revenue: {stats.total_revenue}</li>
        <li>Average track rating: {stats.avg_track_rating}</li>
      </ul>
      <h3 style={{ marginTop: '2rem' }}>Top Genres</h3>
      {stats.most_popular_genres && stats.most_popular_genres.length > 0 ? (
        <ul>
          {stats.most_popular_genres.map((g: any, i: number) => (
            <li key={i}>{g[0]}: {g[1]} tracks</li>
          ))}
        </ul>
      ) : <div>No genre data.</div>}
      <h3 style={{ marginTop: '2rem' }}>Most Active Users</h3>
      {stats.most_active_users && stats.most_active_users.length > 0 ? (
        <ul>
          {stats.most_active_users.map((u: any, i: number) => (
            <li key={i}>User {u[0]}: {u[1]} activity</li>
          ))}
        </ul>
      ) : <div>No user activity data.</div>}
    </div>
  );
};

export default Analytics; 