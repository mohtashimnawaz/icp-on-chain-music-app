import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MusicStudio from './components/MusicStudio';
import TrackList from './components/TrackList';
import MusicUpload from './components/MusicUpload';
import Collaboration from './components/Collaboration';
import Analytics from './components/Analytics';
import ArtistList from './components/ArtistList';
import ArtistRegister from './components/ArtistRegister';
import Messaging from './components/Messaging';
import AdminReports from './components/AdminReports';
import Playlists from './components/Playlists';
import Notifications from './components/Notifications';
import { useAuth } from './contexts/AuthContext';
import { listNotifications } from './services/musicService';
import { useEffect, useState } from 'react';
import './App.css';

const Home = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Welcome to ICP Music Platform</h2>
    <p>Connect your wallet to start your musical journey!</p>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, principal, login, logout, isLoading, walletType } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const data = await listNotifications();
        if (mounted) {
          setUnreadCount(Array.isArray(data) ? data.filter((n: any) => !n.read).length : 0);
        }
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };
    fetchUnread();
    // Optionally, poll every 30s
    const interval = setInterval(fetchUnread, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
        <Link to="/">Home</Link> |{' '}
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <Link to="/studio">Music Studio</Link> |{' '}
        <Link to="/tracks">Track List</Link> |{' '}
        <Link to="/playlists">Playlists</Link> |{' '}
        <Link to="/notifications" style={{ position: 'relative' }}>
          Notifications
          {unreadCount > 0 && (
            <span style={{
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: 12,
              position: 'absolute',
              top: -8,
              right: -18,
              marginLeft: 4
            }}>{unreadCount}</span>
          )}
        </Link> |{' '}
        <Link to="/upload">Music Upload</Link> |{' '}
        <Link to="/collaboration">Collaboration</Link> |{' '}
        <Link to="/analytics">Analytics</Link> |{' '}
        <Link to="/artists">Artists</Link> |{' '}
        <Link to="/register-artist">Register Artist</Link> |{' '}
        <Link to="/messaging">Messaging</Link> |{' '}
        <Link to="/admin/reports">Admin Reports</Link>
        <span style={{ float: 'right' }}>
          {isAuthenticated ? (
            <>
              <span>Logged in as {principal} ({walletType})</span>
              <button onClick={logout} disabled={isLoading} style={{ marginLeft: 8 }}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => login('plug')} disabled={isLoading} style={{ marginRight: 8 }}>Connect with Plug</button>
              <button onClick={() => login('internet-identity')} disabled={isLoading}>Connect with Internet Identity</button>
            </>
          )}
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studio" element={<MusicStudio />} />
        <Route path="/tracks" element={<TrackList />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/upload" element={<MusicUpload />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/artists" element={<ArtistList />} />
        <Route path="/register-artist" element={<ArtistRegister />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </div>
  );
};

export default App; 