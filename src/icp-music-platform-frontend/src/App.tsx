import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';
import { Dashboard } from './components/Dashboard';
import { MusicStudio } from './components/MusicStudio';
import { MessageCenter } from './components/MessageCenter';
import { useTracks, useArtists, usePlaylists, useNotifications } from './hooks/useMusicData';
import { TrackList } from './components/TrackList';
import './App.css';

// Page components with real data integration
const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="page">
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <div className="welcome-section">
          <h2>Welcome to ICP Music Platform!</h2>
          <p>Connect with Internet Identity to start your musical journey!</p>
          <div className="features">
            <h3>Platform Features:</h3>
            <ul>
              <li>🎵 Create and manage music tracks with advanced collaboration</li>
              <li>🤝 Real-time collaboration with workflow management</li>
              <li>💰 Transparent royalty splits and revenue tracking</li>
              <li>📊 Comprehensive analytics and performance metrics</li>
              <li>🎪 Professional music studio environment</li>
              <li>💬 Built-in messaging and notification system</li>
              <li>🔧 Task management and project workflows</li>
              <li>📈 Advanced revenue insights and reporting</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Explore = () => {
  const { tracks, loading, rateTrack, commentOnTrack } = useTracks();
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      <h2>Explore Music</h2>
      <p>Discover amazing tracks from artists around the world!</p>
      
      <TrackList 
        tracks={tracks} 
        loading={loading}
        onRate={isAuthenticated ? rateTrack : undefined}
        onComment={isAuthenticated ? commentOnTrack : undefined}
      />
    </div>
  );
};

const Studio = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h2>Music Studio</h2>
        <p>Please log in to access the music studio.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <MusicStudio />
    </div>
  );
};

const Playlists = () => {
  const { playlists, loading, createPlaylist } = usePlaylists();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h2>Playlists</h2>
        <p>Please log in to access your playlists.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Your Playlists</h2>
      {loading ? (
        <div className="loading">Loading playlists...</div>
      ) : playlists.length > 0 ? (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div key={playlist.id.toString()} className="playlist-card">
              <h3>{playlist.name}</h3>
              {playlist.description && <p>{playlist.description}</p>}
              <div className="playlist-meta">
                <span>{playlist.track_ids.length} tracks</span>
                <span>Created: {new Date(Number(playlist.created_at) / 1000000).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-playlists">
          <h3>No playlists yet</h3>
          <p>Create your first playlist to organize your favorite tracks!</p>
          <button 
            className="create-button"
            onClick={() => createPlaylist('My First Playlist', 'A collection of my favorite tracks')}
          >
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { isAuthenticated, principal } = useAuth();
  const { artists, registerArtist } = useArtists();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h2>Profile</h2>
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  // For now, assume first artist belongs to current user (mock implementation)
  const userArtist = artists.length > 0 ? artists[0] : null;

  return (
    <div className="page">
      <h2>Your Profile</h2>
      
      <div className="profile-info">
        <div className="principal-info">
          <h3>Identity</h3>
          <p className="principal">{principal}</p>
        </div>

        {userArtist ? (
          <div className="artist-info">
            <h3>Artist Profile</h3>
            <div className="artist-card">
              <h4>{userArtist.name}</h4>
              <p>{userArtist.bio}</p>
              <div className="artist-stats">
                <span>Royalty Balance: {userArtist.royalty_balance.toString()} tokens</span>
                {userArtist.social && <span>Social: {userArtist.social}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="register-artist">
            <h3>Become an Artist</h3>
            <p>Register as an artist to start creating and sharing music!</p>
            <button 
              className="register-button"
              onClick={() => registerArtist('New Artist', 'A passionate musician ready to share my creativity with the world!')}
            >
              Register as Artist
            </button>
          </div>
        )}

        <div className="notifications-section">
          <h3>Notifications {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}</h3>
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id.toString()} 
                  className={`notification ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(Number(notification.timestamp) / 1000000).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h2>Admin</h2>
        <p>Please log in to access admin tools.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <p>Administrative tools and platform moderation.</p>
      <div className="coming-soon">
        <h3>Admin Features (Coming Soon):</h3>
        <ul>
          <li>👥 User and content moderation</li>
          <li>📊 Platform analytics</li>
          <li>🚨 Handle reports and disputes</li>
          <li>🔔 System notifications</li>
          <li>⚙️ Platform configuration</li>
        </ul>
      </div>
    </div>
  );
};

const Messages = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page">
        <h2>Messages</h2>
        <p>Please log in to access your messages.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <MessageCenter />
    </div>
  );
};

// Navigation component with authentication
const Navbar = () => (
  <nav className="navbar">
    <div className="nav-brand">
      <h1>🎵 ICP Music Platform</h1>
    </div>
    <div className="nav-links">
      <Link to="/">Dashboard</Link>
      <Link to="/explore">Explore</Link>
      <Link to="/studio">Studio</Link>
      <Link to="/playlists">Playlists</Link>
      <Link to="/messages">Messages</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/admin">Admin</Link>
    </div>
    <AuthButton />
  </nav>
);

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
