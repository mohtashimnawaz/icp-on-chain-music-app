import React from 'react';
import './Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  useTracks, 
  useArtists, 
  usePlaylists, 
  useNotifications,
  useActivity,
  useUserEngagement,
  useRoyalties
} from '../hooks/useMusicData';

export const Dashboard: React.FC = () => {
  const { isAuthenticated, principal } = useAuth();
  const { tracks, loading: tracksLoading } = useTracks();
  const { artists, loading: artistsLoading } = useArtists();
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const { notifications, unreadCount } = useNotifications();
  const { activities, loading: activitiesLoading } = useActivity();
  
  // Mock user ID for demo - in real app, get from authentication
  const mockUserId = BigInt(1);
  const mockArtistId = BigInt(1);
  
  const { metrics: userMetrics, loading: metricsLoading } = useUserEngagement(mockUserId);
  const { balance: royaltyBalance, loading: royaltyLoading } = useRoyalties(mockArtistId);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="welcome-section">
          <h2>Welcome to ICP Music Platform</h2>
          <p>Please connect with Internet Identity to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back!</h1>
        <p>Principal: {principal}</p>
        {unreadCount > 0 && (
          <div className="notification-badge">
            {unreadCount} new notifications
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="stats-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{tracksLoading ? '...' : tracks.length}</h3>
              <p>Total Tracks</p>
            </div>
            <div className="stat-card">
              <h3>{artistsLoading ? '...' : artists.length}</h3>
              <p>Artists</p>
            </div>
            <div className="stat-card">
              <h3>{playlistsLoading ? '...' : playlists.length}</h3>
              <p>Playlists</p>
            </div>
            <div className="stat-card">
              <h3>{royaltyLoading ? '...' : (royaltyBalance ? royaltyBalance.toString() : '0')}</h3>
              <p>Royalty Balance (ICP)</p>
            </div>
          </div>
        </div>

        {/* User Engagement Metrics */}
        {userMetrics && !metricsLoading && (
          <div className="engagement-section">
            <h2>Your Performance</h2>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-value">{userMetrics.total_tracks_created.toString()}</span>
                <span className="metric-label">Tracks Created</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{userMetrics.total_plays_received.toString()}</span>
                <span className="metric-label">Total Plays</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{userMetrics.followers_count.toString()}</span>
                <span className="metric-label">Followers</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{userMetrics.engagement_score.toFixed(2)}</span>
                <span className="metric-label">Engagement Score</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          {activitiesLoading ? (
            <div className="loading">Loading activities...</div>
          ) : activities.length > 0 ? (
            <div className="activity-list">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-details">{activity.details}</div>
                  <div className="activity-time">
                    {new Date(Number(activity.timestamp) / 1000000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No recent activity</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary">
              Upload New Track
            </button>
            <button className="action-btn">
              Create Playlist
            </button>
            <button className="action-btn">
              Start Collaboration
            </button>
            <button className="action-btn">
              View Analytics
            </button>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="notifications-section">
          <h2>Notifications</h2>
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id.toString()} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(Number(notification.timestamp) / 1000000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No notifications</div>
          )}
        </div>

        {/* Recent Tracks */}
        <div className="tracks-section">
          <h2>Your Recent Tracks</h2>
          {tracksLoading ? (
            <div className="loading">Loading tracks...</div>
          ) : tracks.length > 0 ? (
            <div className="tracks-list">
              {tracks.slice(0, 3).map((track) => (
                <div key={track.id.toString()} className="track-item">
                  <div className="track-info">
                    <h3>{track.title}</h3>
                    <p>{track.description}</p>
                  </div>
                  <div className="track-stats">
                    <span className="play-count">{track.play_count.toString()} plays</span>
                    <span className="rating">
                      {track.ratings.length > 0 
                        ? (track.ratings.reduce((sum, [, rating]) => sum + rating, 0) / track.ratings.length).toFixed(1)
                        : 'No ratings'
                      } ⭐
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No tracks yet</div>
          )}
        </div>
      </div>
    </div>
  );
};
