import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MusicStudio from './components/MusicStudio';
import TrackList from './components/TrackList';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const Home = () => (
  <div style={{ padding: '2rem' }}>
    <h2>Welcome to ICP Music Platform</h2>
    <p>Connect your wallet to start your musical journey!</p>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, principal, login, logout, isLoading, walletType } = useAuth();
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
        <Link to="/">Home</Link> |{' '}
        <Link to="/dashboard">Dashboard</Link> |{' '}
        <Link to="/studio">Music Studio</Link> |{' '}
        <Link to="/tracks">Track List</Link>
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
      </Routes>
    </div>
  );
};

export default App; 