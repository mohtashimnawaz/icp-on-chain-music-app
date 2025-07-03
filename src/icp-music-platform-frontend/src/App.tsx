import React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
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
import ModerationQueue from './components/ModerationQueue';
import Suspensions from './components/Suspensions';
import AuditLog from './components/AuditLog';
import FollowedTracks from './components/FollowedTracks';
import BannedKeywords from './components/BannedKeywords';
import './App.css';
import { SnackbarProvider } from './contexts/SnackbarContext';

// MUI imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';

const Home = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4" gutterBottom>Welcome to ICP Music Platform</Typography>
    <Typography>Connect your wallet to start your musical journey!</Typography>
  </Box>
);

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#181818', paper: '#222' },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { borderBottom: '1px solid #333' } } },
  },
});

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/studio', label: 'Music Studio' },
  { to: '/tracks', label: 'Track List' },
  { to: '/playlists', label: 'Playlists' },
  { to: '/followed-tracks', label: 'Followed Tracks' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/upload', label: 'Music Upload' },
  { to: '/collaboration', label: 'Collaboration' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/artists', label: 'Artists' },
  { to: '/register-artist', label: 'Register Artist' },
  { to: '/messaging', label: 'Messaging' },
];
const adminLinks = [
  { to: '/admin/reports', label: 'Reports' },
  { to: '/moderation-queue', label: 'Moderation' },
  { to: '/suspensions', label: 'Suspensions' },
  { to: '/audit-log', label: 'Audit Log' },
  { to: '/banned-keywords', label: 'Banned Keywords' },
];

const App: React.FC = () => {
  const { isAuthenticated, principal, login, logout, isLoading, walletType } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    const interval = setInterval(fetchUnread, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ display: 'flex', flexWrap: 'wrap' }}>
              <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { xs: 'block', md: 'none' } }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
                ICP Music Platform
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                {navLinks.map(link => (
                  <Button key={link.to} color="inherit" component={RouterLink} to={link.to} sx={{ position: 'relative' }}>
                    {link.label}
                    {link.label === 'Notifications' && unreadCount > 0 && (
                      <Box component="span" sx={{
                        background: 'red', color: 'white', borderRadius: '50%', px: 1, fontSize: 12, position: 'absolute', top: -8, right: -18, ml: 1
                      }}>{unreadCount}</Box>
                    )}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>Admin:</Typography>
                {adminLinks.map(link => (
                  <Button key={link.to} color="inherit" component={RouterLink} to={link.to}>{link.label}</Button>
                ))}
              </Box>
              <Box sx={{ ml: 2 }}>
                {isAuthenticated ? (
                  <>
                    <IconButton onClick={handleMenu} color="inherit">
                      <Avatar sx={{ width: 32, height: 32 }}>{principal ? principal.toString().slice(0, 2).toUpperCase() : '?'}</Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                      <MenuItem disabled>Logged in as {principal ? principal.toString() : ''} ({walletType})</MenuItem>
                      <MenuItem onClick={logout} disabled={isLoading}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button onClick={() => login('plug')} disabled={isLoading} color="primary" variant="contained" sx={{ mr: 1 }}>Connect with Plug</Button>
                    <Button onClick={() => login('internet-identity')} disabled={isLoading} color="secondary" variant="contained">Connect with Internet Identity</Button>
                  </>
                )}
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
              <List>
                {navLinks.map(link => (
                  <ListItem key={link.to} disablePadding>
                    <ListItemButton component={RouterLink} to={link.to}>
                      <ListItemText primary={link.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
              <List>
                <ListItem><Typography variant="subtitle2">Admin</Typography></ListItem>
                {adminLinks.map(link => (
                  <ListItem key={link.to} disablePadding>
                    <ListItemButton component={RouterLink} to={link.to}>
                      <ListItemText primary={link.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
          <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/studio" element={<MusicStudio />} />
              <Route path="/tracks" element={<TrackList />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/followed-tracks" element={<FollowedTracks />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/upload" element={<MusicUpload />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/artists" element={<ArtistList />} />
              <Route path="/register-artist" element={<ArtistRegister />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/moderation-queue" element={<ModerationQueue />} />
              <Route path="/suspensions" element={<Suspensions />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="/banned-keywords" element={<BannedKeywords />} />
            </Routes>
          </Box>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App; 