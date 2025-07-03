import React, { useEffect, useState } from 'react';
import { getPlatformAnalytics, getRevenueInsights, getTrackPerformanceMetrics, listTracks } from '../services/musicService';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [trackMetrics, setTrackMetrics] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const [platform, rev, trks] = await Promise.all([
          getPlatformAnalytics(),
          getRevenueInsights(),
          listTracks()
        ]);
        setStats(platform);
        setRevenue(rev);
        setTracks(trks);
      } catch (e) {
        setError('Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleTrackSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTrack(id);
    setTrackMetrics(null);
    if (!id) return;
    setTrackLoading(true);
    try {
      const metrics = await getTrackPerformanceMetrics(BigInt(id));
      setTrackMetrics(metrics);
    } catch {
      setTrackMetrics(null);
    } finally {
      setTrackLoading(false);
    }
  };

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

      {/* Revenue Insights */}
      <h2 style={{ marginTop: '3rem' }}>Revenue Insights</h2>
      {revenue ? (
        <>
          <ul>
            <li>Total Platform Revenue: {revenue.total_platform_revenue}</li>
          </ul>
          <h4>Revenue by Genre</h4>
          {revenue.revenue_by_genre && revenue.revenue_by_genre.length > 0 ? (
            <ul>
              {revenue.revenue_by_genre.map((g: any, i: number) => (
                <li key={i}>{g[0]}: {g[1]}</li>
              ))}
            </ul>
          ) : <div>No genre revenue data.</div>}
          <h4>Top Earning Tracks</h4>
          {revenue.top_earning_tracks && revenue.top_earning_tracks.length > 0 ? (
            <ul>
              {revenue.top_earning_tracks.map((t: any, i: number) => (
                <li key={i}>Track {t[0]}: {t[1]}</li>
              ))}
            </ul>
          ) : <div>No top tracks data.</div>}
          <h4>Top Earning Artists</h4>
          {revenue.top_earning_artists && revenue.top_earning_artists.length > 0 ? (
            <ul>
              {revenue.top_earning_artists.map((a: any, i: number) => (
                <li key={i}>Artist {a[0]}: {a[1]}</li>
              ))}
            </ul>
          ) : <div>No top artists data.</div>}
          <h4>Monthly Revenue Trend</h4>
          {revenue.monthly_revenue_trend && revenue.monthly_revenue_trend.length > 0 ? (
            <ul>
              {revenue.monthly_revenue_trend.map((m: any, i: number) => (
                <li key={i}>Month {new Date(Number(m[0]) * 1000).toLocaleDateString()}: {m[1]}</li>
              ))}
            </ul>
          ) : <div>No monthly trend data.</div>}
        </>
      ) : <div>No revenue data.</div>}

      {/* Track Performance Metrics */}
      <h2 style={{ marginTop: '3rem' }}>Track Performance Metrics</h2>
      <div style={{ marginBottom: 16 }}>
        <label>Select Track: </label>
        <select value={selectedTrack} onChange={handleTrackSelect}>
          <option value="">-- Select --</option>
          {tracks.map((t: any) => (
            <option key={t.id.toString()} value={t.id.toString()}>{t.title}</option>
          ))}
        </select>
      </div>
      {trackLoading && <div>Loading track metrics...</div>}
      {trackMetrics && (
        <ul>
          <li>Total Plays: {trackMetrics.total_plays}</li>
          <li>Unique Listeners: {trackMetrics.unique_listeners}</li>
          <li>Average Rating: {trackMetrics.avg_rating}</li>
          <li>Total Revenue: {trackMetrics.total_revenue}</li>
          <li>Comments Count: {trackMetrics.comments_count}</li>
          <li>Shares Count: {trackMetrics.shares_count}</li>
          <li>Download Count: {trackMetrics.download_count}</li>
          <li>Engagement Rate: {trackMetrics.engagement_rate}</li>
          <li>Growth Rate: {trackMetrics.growth_rate}</li>
        </ul>
      )}
    </div>
  );
};

export default Analytics; 