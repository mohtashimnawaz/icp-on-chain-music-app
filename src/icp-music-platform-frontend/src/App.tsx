import React from 'react';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
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
import MusicPlayer from './components/MusicPlayer';
import MusicVisualizer3D from './components/MusicVisualizer3D';
import MusicPlayer3D from './components/MusicPlayer3D';
import MusicStudio3D from './components/MusicStudio3D';
import Home3D from './components/Home3D';
import './App.css';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { LoadingProvider } from './contexts/LoadingContext';
import TuneSphereLogo from './assets/tunesphere-logo.svg';

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
import Paper from '@mui/material/Paper';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';

// Icons for navigation
import HomeIcon from '@mui/icons-material/Home';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MicIcon from '@mui/icons-material/Mic';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportIcon from '@mui/icons-material/Report';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';

const Home = () => (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Box sx={{ mb: 6 }}>
      <Typography variant="h2" gutterBottom sx={{ 
        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}>
        Welcome to TuneSphere
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
        Decentralized. Immersive. Limitless Music.
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
        The decentralized music platform built on Internet Computer
      </Typography>
    </Box>
    
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 6 }}>
      <Paper sx={{ p: 3, textAlign: 'center', background: 'rgba(25, 118, 210, 0.1)' }}>
        <Typography variant="h6" gutterBottom color="primary">🎵 Upload & Share</Typography>
        <Typography variant="body2" color="text.secondary">
          Upload your music tracks and share them with the world on a decentralized platform
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3, textAlign: 'center', background: 'rgba(156, 39, 176, 0.1)' }}>
        <Typography variant="h6" gutterBottom color="secondary">💰 Earn Royalties</Typography>
        <Typography variant="body2" color="text.secondary">
          Get paid directly through smart contracts for your music streams and downloads
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 3, textAlign: 'center', background: 'rgba(76, 175, 80, 0.1)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>🤝 Collaborate</Typography>
        <Typography variant="body2" color="text.secondary">
          Connect with other artists and collaborate on music projects seamlessly
        </Typography>
      </Paper>
    </Box>
    
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>Connect your wallet to start your musical journey!</Typography>
      <Typography variant="body2" color="text.secondary">
        Choose between Plug Wallet or Internet Identity to get started
      </Typography>
    </Box>
  </Box>
);

const navCategories = [
  {
    title: 'Main',
    items: [
      { to: '/', label: 'Home', icon: <HomeIcon /> },
      { to: '/home-3d', label: '3D Home', icon: <ViewInArIcon />, badge: 'NEW' },
      { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    ]
  },
  {
    title: 'Music',
    items: [
      { to: '/tracks', label: 'Track List', icon: <MusicNoteIcon /> },
      { to: '/playlists', label: 'Playlists', icon: <QueueMusicIcon /> },
      { to: '/followed-tracks', label: 'Followed Tracks', icon: <FavoriteIcon /> },
      { to: '/upload', label: 'Music Upload', icon: <CloudUploadIcon /> },
      { to: '/player', label: 'Music Player', icon: <PlayArrowIcon /> },
    ]
  },
  {
    title: '3D Experience',
    items: [
      { to: '/visualizer-3d', label: '3D Visualizer', icon: <VisibilityIcon />, badge: 'NEW' },
      { to: '/player-3d', label: '3D Player', icon: <HeadphonesIcon />, badge: 'NEW' },
      { to: '/studio-3d', label: '3D Studio', icon: <MicIcon />, badge: 'NEW' },
    ]
  },
  {
    title: 'Community',
    items: [
      { to: '/collaboration', label: 'Collaboration', icon: <GroupIcon /> },
      { to: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
      { to: '/artists', label: 'Artists', icon: <PersonIcon /> },
      { to: '/register-artist', label: 'Register Artist', icon: <PersonAddIcon /> },
      { to: '/messaging', label: 'Messaging', icon: <MessageIcon /> },
      { to: '/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
    ]
  },
  {
    title: 'Studio',
    items: [
      { to: '/studio', label: 'Music Studio', icon: <MicIcon /> },
    ]
  }
];

const adminLinks = [
  { to: '/admin/reports', label: 'Reports', icon: <ReportIcon /> },
  { to: '/moderation-queue', label: 'Moderation', icon: <FilterListIcon /> },
  { to: '/suspensions', label: 'Suspensions', icon: <SecurityIcon /> },
  { to: '/audit-log', label: 'Audit Log', icon: <HistoryIcon /> },
  { to: '/banned-keywords', label: 'Banned Keywords', icon: <BlockIcon /> },
];

// 1. Add new vibrant color palette and gradients
const vibrantGradients = {
  main: 'linear-gradient(90deg, #7b1fa2 0%, #1976d2 40%, #42a5f5 70%, #00e5ff 100%)',
  accent: 'linear-gradient(90deg, #ff9800 0%, #f44336 100%)',
  green: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
  pink: 'linear-gradient(90deg, #ff6a00 0%, #ee0979 100%)',
  blue: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
  purple: 'linear-gradient(90deg, #7b1fa2 0%, #9c27b0 100%)',
};

const videoFiles = [
  '/studio-1.mp4',
  '/studio-2.mp4',
  '/studio-3.mp4',
  '/studio-4.mp4',
  '/studio-5.mp4',
  '/studio-6.mp4',
];

const App: React.FC = () => {
  const { isAuthenticated, principal, login, logout, isLoading, walletType } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const location = useLocation();
  const [currentVideo, setCurrentVideo] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Only run video background on home page
  const isHome = location.pathname === '/';
  // 3D pages
  const is3DPage = ['/home-3d', '/visualizer-3d', '/player-3d', '/studio-3d'].includes(location.pathname);

  // Cycle to next video on end
  const handleVideoEnd = () => {
    setCurrentVideo((prev) => {
      if (prev === videoFiles.length - 1) {
        // Restart from first video immediately
        return 0;
      } else {
        return prev + 1;
      }
    });
  };

  // Reset to first video if leaving home
  useEffect(() => {
    if (!isHome) setCurrentVideo(0);
  }, [isHome]);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Save theme preference to localStorage
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#7b1fa2' },
      secondary: { main: '#00e5ff' },
      success: { main: '#43e97b' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      info: { main: '#42a5f5' },
      background: {
        default: mode === 'dark' ? '#18122B' : '#f5f5fa',
        paper: mode === 'dark' ? '#231942' : '#fff',
      },
      text: {
        primary: mode === 'dark' ? '#fff' : '#18122B',
        secondary: mode === 'dark' ? '#b39ddb' : '#5e548e',
      },
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      h1: { fontWeight: 900, letterSpacing: 1 },
      h2: { fontWeight: 800, letterSpacing: 1 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 700, letterSpacing: 1 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: `2px solid ${mode === 'dark' ? '#7b1fa2' : '#42a5f5'}`,
            background: vibrantGradients.main,
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease-in-out infinite',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 4px 32px 0 rgba(123,31,162,0.18)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            borderRadius: 18,
            boxShadow: '0 8px 32px 0 rgba(123,31,162,0.12)',
            background: mode === 'dark' ? 'rgba(34,34,54,0.95)' : 'rgba(255,255,255,0.95)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.03)',
              boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
              background: vibrantGradients.purple,
              color: '#fff',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 700,
            background: vibrantGradients.accent,
            color: '#fff',
            boxShadow: '0 2px 8px 0 #f44336',
            transition: 'all 0.18s',
            '&:hover': {
              background: vibrantGradients.pink,
              color: '#fff',
              boxShadow: '0 6px 18px 0 #ee0979',
              transform: 'translateY(-2px) scale(1.04)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            letterSpacing: 0.5,
            background: vibrantGradients.green,
            color: '#18122B',
          },
        },
      },
    },
  });

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
      {/* Animated gradient keyframes for vibrant backgrounds */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <LoadingProvider>
        <SnackbarProvider>
          {/* Video background for all non-3D pages */}
          {!is3DPage && (
            <video
              ref={videoRef}
              key={currentVideo} // force reload on video change
              src={videoFiles[currentVideo]}
              autoPlay
              muted
              loop={false}
              onEnded={handleVideoEnd}
              playsInline
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: 0,
                filter: 'brightness(0.18) blur(1.5px)',
                pointerEvents: 'none',
                transition: 'opacity 0.7s',
              }}
            />
          )}
          {/* Overlay for readability on all non-3D pages */}
          {!is3DPage && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1,
                background: 'rgba(24, 18, 43, 0.82)', // more opaque
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Main app content overlays video and overlay */}
          <Box sx={{ minHeight: '100vh', bgcolor: isHome || !is3DPage ? 'transparent' : 'background.default', color: 'text.primary', position: 'relative', zIndex: 2 }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{
            background: 'linear-gradient(90deg, rgba(34,34,34,0.95) 60%, rgba(25,118,210,0.7) 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
            borderBottom: '1.5px solid #222',
          }}>
            <Toolbar sx={{
              display: 'flex',
              flexWrap: 'wrap',
              minHeight: 72,
              px: { xs: 1, md: 4 },
              py: 1,
              alignItems: 'center',
              gap: 2,
            }}>
              <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { xs: 'block', md: 'none' } }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 700, letterSpacing: 1, mr: 3, display: 'flex', alignItems: 'center' }}>
                <img src={TuneSphereLogo} alt="TuneSphere Logo" style={{ height: 36, marginRight: 10, verticalAlign: 'middle' }} />
                TuneSphere
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
                {/* Main Navigation */}
                {[{
                  label: 'Home', icon: <HomeIcon />, to: '/'
                }, {
                  label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard'
                }, {
                  label: 'Tracks', icon: <MusicNoteIcon />, to: '/tracks'
                }, {
                  label: 'Playlists', icon: <QueueMusicIcon />, to: '/playlists'
                }, {
                  label: 'Upload', icon: <CloudUploadIcon />, to: '/upload'
                }, {
                  label: 'Player', icon: <PlayArrowIcon />, to: '/player'
                }, {
                  label: '3D Home', icon: <ViewInArIcon />, to: '/home-3d', badge: 'NEW'
                }, {
                  label: 'Notifications', icon: <NotificationsIcon />, to: '/notifications', badge: unreadCount > 0 ? unreadCount : null
                }].map((item, idx) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    component={RouterLink}
                    to={item.to}
                    startIcon={item.icon}
                    sx={{
                      fontWeight: 600,
                      letterSpacing: 1,
                      px: 2.2,
                      py: 1.2,
                      borderRadius: 2,
                      fontSize: '1.08rem',
                      background: 'rgba(255,255,255,0.01)',
                      boxShadow: '0 1px 4px 0 rgba(25,118,210,0.04)',
                      transition: 'all 0.18s',
                      position: 'relative',
                      '&:hover': {
                        background: 'rgba(25,118,210,0.13)',
                        color: 'primary.main',
                        transform: 'translateY(-2px) scale(1.04)',
                        boxShadow: '0 4px 16px 0 rgba(25,118,210,0.10)',
                        textDecoration: 'underline',
                      },
                      ...(item.label === '3D Home' && {
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 2px 8px #1976d2',
                      })
                    }}
                  >
                    {item.label}
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 18,
                          fontSize: '0.7rem',
                          backgroundColor: item.label === 'Notifications' ? 'error.main' : 'success.main',
                          color: 'white',
                          fontWeight: 700,
                          letterSpacing: 0.5
                        }}
                      />
                    )}
                  </Button>
                ))}
              </Box>
              {/* Divider between menu and right controls */}
              <Box sx={{ height: 40, width: 1, bgcolor: 'rgba(255,255,255,0.08)', mx: 2, display: { xs: 'none', md: 'block' } }} />
              {/* Right controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                  <IconButton onClick={toggleColorMode} color="inherit" sx={{
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.04)',
                    '&:hover': { background: 'rgba(25,118,210,0.13)' }
                  }}>
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
                {isAuthenticated ? (
                  <>
                    <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1, borderRadius: 2, background: 'rgba(255,255,255,0.04)', '&:hover': { background: 'rgba(25,118,210,0.13)' } }}>
                      <Avatar sx={{ width: 36, height: 36, fontWeight: 700, bgcolor: 'primary.main', color: 'white', fontSize: '1.1rem', boxShadow: '0 2px 8px #1976d2' }}>{principal ? principal.toString().slice(0, 2).toUpperCase() : '?'}</Avatar>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                      <MenuItem disabled>Logged in as {principal ? principal.toString() : ''} ({walletType})</MenuItem>
                      <MenuItem onClick={logout} disabled={isLoading}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button onClick={() => login('plug')} disabled={isLoading} color="primary" variant="contained" sx={{ mr: 1, borderRadius: 2, fontWeight: 600 }}>Connect with Plug</Button>
                    <Button onClick={() => login('internet-identity')} disabled={isLoading} color="secondary" variant="contained" sx={{ borderRadius: 2, fontWeight: 600 }}>Connect with Internet Identity</Button>
                  </>
                )}
                {/* Beautiful Admin button */}
                <Tooltip title="Admin Panel">
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/reports"
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{
                      ml: 2,
                      borderRadius: 3,
                      fontWeight: 700,
                      px: 2.5,
                      py: 1.2,
                      background: 'linear-gradient(90deg, #5c1a1b 60%, #a83232 100%)',
                      color: 'white',
                      boxShadow: '0 2px 8px 0 #a83232',
                      letterSpacing: 1,
                      transition: 'all 0.18s',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #a83232 60%, #5c1a1b 100%)',
                        color: '#fff',
                        transform: 'translateY(-2px) scale(1.04)',
                        boxShadow: '0 6px 18px 0 #a83232',
                      }
                    }}
                  >
                    Admin
                  </Button>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}>
            <Box sx={{ width: 280 }} role="presentation">
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  TuneSphere
                </Typography>
              </Box>
              
              <List sx={{ pt: 1 }}>
                {/* Main Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    MAIN
                  </Typography>
                </ListItem>
                {navCategories[0].items.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      {item.badge && (
                        <Chip 
                          label={item.badge} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            backgroundColor: 'success.main',
                            color: 'white'
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Music Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    MUSIC
                  </Typography>
                </ListItem>
                {navCategories[1].items.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* 3D Experience Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    3D EXPERIENCE
                  </Typography>
                </ListItem>
                {navCategories[2].items.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      {item.badge && (
                        <Chip 
                          label={item.badge} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            backgroundColor: 'success.main',
                            color: 'white'
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Community Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    COMMUNITY
                  </Typography>
                </ListItem>
                {navCategories[3].items.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      {item.label === 'Notifications' && unreadCount > 0 && (
                        <Chip 
                          label={unreadCount} 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            backgroundColor: 'error.main',
                            color: 'white'
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Studio Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    STUDIO
                  </Typography>
                </ListItem>
                {navCategories[4].items.map(item => (
                  <ListItem key={item.to} disablePadding>
                    <ListItemButton component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Admin Section */}
                <ListItem>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    ADMIN
                  </Typography>
                </ListItem>
                {adminLinks.map(link => (
                  <ListItem key={link.to} disablePadding>
                    <ListItemButton component={RouterLink} to={link.to} onClick={() => setDrawerOpen(false)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
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
                <Route path="/home-3d" element={<Home3D />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/studio" element={<MusicStudio />} />
                <Route path="/tracks" element={<TrackList />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/followed-tracks" element={<FollowedTracks />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/upload" element={<MusicUpload />} />
                <Route path="/player" element={<MusicPlayer />} />
                <Route path="/collaboration" element={<Collaboration />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/artists" element={<ArtistList />} />
                <Route path="/register-artist" element={<ArtistRegister />} />
                <Route path="/messaging" element={<Messaging />} />
                <Route path="/visualizer-3d" element={<MusicVisualizer3D />} />
                <Route path="/player-3d" element={<MusicPlayer3D />} />
                <Route path="/studio-3d" element={<MusicStudio3D />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/moderation-queue" element={<ModerationQueue />} />
                <Route path="/suspensions" element={<Suspensions />} />
                <Route path="/audit-log" element={<AuditLog />} />
                <Route path="/banned-keywords" element={<BannedKeywords />} />
              </Routes>
          </Box>
                  </Box>
        </SnackbarProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
};

export default App; 