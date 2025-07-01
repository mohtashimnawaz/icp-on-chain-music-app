import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import './App.css';

// Page components
const Home = () => (
  <div className="page">
    <h2>Home</h2>
    <p>Welcome to ICP Music Platform!</p>
    <div className="features">
      <h3>Features:</h3>
      <ul>
        <li>Create and manage music tracks</li>
        <li>Collaborate with other artists</li>
        <li>Manage royalty splits</li>
        <li>Track analytics and ratings</li>
        <li>Build playlists</li>
      </ul>
    </div>
  </div>
);

const Explore = () => (
  <div className="page">
    <h2>Explore</h2>
    <p>Discover artists and tracks.</p>
    <div className="coming-soon">
      <h3>Coming Soon:</h3>
      <ul>
        <li>Browse public tracks</li>
        <li>Search by genre and tags</li>
        <li>Follow your favorite artists</li>
        <li>Rate and comment on tracks</li>
      </ul>
    </div>
  </div>
);

const Playlists = () => (
  <div className="page">
    <h2>Playlists</h2>
    <p>Your playlists will appear here.</p>
    <div className="coming-soon">
      <h3>Features:</h3>
      <ul>
        <li>Create custom playlists</li>
        <li>Add tracks from the platform</li>
        <li>Share playlists with others</li>
        <li>Organize by mood or genre</li>
      </ul>
    </div>
  </div>
);

const Profile = () => (
  <div className="page">
    <h2>Profile</h2>
    <p>Manage your profile and settings.</p>
    <div className="coming-soon">
      <h3>Profile Features:</h3>
      <ul>
        <li>Artist registration and bio</li>
        <li>Upload profile images</li>
        <li>Link social media accounts</li>
        <li>View royalty balance</li>
        <li>Track your analytics</li>
      </ul>
    </div>
  </div>
);

const Admin = () => (
  <div className="page">
    <h2>Admin</h2>
    <p>Admin tools and moderation.</p>
    <div className="coming-soon">
      <h3>Admin Tools:</h3>
      <ul>
        <li>User and content moderation</li>
        <li>Handle reports and disputes</li>
        <li>Platform analytics</li>
        <li>System notifications</li>
      </ul>
    </div>
  </div>
);

// Navigation component
const Navbar = () => (
  <nav className="navbar">
    <div className="nav-brand">
      <h1>🎵 ICP Music Platform</h1>
    </div>
    <div className="nav-links">
      <Link to="/">Home</Link>
      <Link to="/explore">Explore</Link>
      <Link to="/playlists">Playlists</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/admin">Admin</Link>
    </div>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
