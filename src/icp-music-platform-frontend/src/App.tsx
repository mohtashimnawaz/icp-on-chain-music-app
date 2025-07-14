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
import { useEffect, useState, useCallback } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    style={{ padding: '4rem', textAlign: 'center' }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      style={{ marginBottom: '6rem' }}
    >
      <Typography variant="h2" gutterBottom sx={{ 
        color: '#fff',
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}>
        Welcome to TuneSphere
      </Typography>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
          Decentralized. Immersive. Limitless Music.
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          The decentralized music platform built on Internet Computer
        </Typography>
      </motion.div>
    </motion.div>
    
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}
    >
      {[
        { title: '🎵 Upload & Share', desc: 'Upload your music tracks and share them with the world on a decentralized platform', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { title: '💰 Earn Royalties', desc: 'Get paid directly through smart contracts for your music streams and downloads', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { title: '🤝 Collaborate', desc: 'Connect with other artists and collaborate on music projects seamlessly', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      ].map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, rotateY: -15 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
          whileHover={{ 
            scale: 1.05, 
            rotateY: 5,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: item.gradient,
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transformStyle: 'preserve-3d'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 'bold' }}>
            {item.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            {item.desc}
          </Typography>
        </motion.div>
      ))}
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      style={{ marginBottom: '4rem' }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 'bold' }}>
        Connect your wallet to start your musical journey!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Choose between Plug Wallet or Internet Identity to get started
      </Typography>
    </motion.div>
  </motion.div>
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
  const handleVideoEnd = useCallback(() => {
    setCurrentVideo((prev) => {
      const nextIndex = (prev + 1) % videoFiles.length;
      console.log(`Video ended: ${videoFiles[prev]} -> ${videoFiles[nextIndex]}`);
      return nextIndex;
    });
  }, []);

  // Ensure video continues playing after theme changes
  useEffect(() => {
    if (videoRef.current && !is3DPage) {
      const video = videoRef.current;
      const ensureVideoPlays = async () => {
        try {
          if (video.paused) {
            await video.play();
          }
        } catch (error) {
          console.warn('Video autoplay prevented:', error);
        }
      };
      
      // Small delay to ensure CSS variables are updated
      const timeoutId = setTimeout(ensureVideoPlays, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [mode, is3DPage]); // React to theme mode changes

  // Reset to first video if leaving home, but preserve playback state
  useEffect(() => {
    if (!isHome && currentVideo !== 0) {
      setCurrentVideo(0);
    }
  }, [isHome, currentVideo]);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Update document data-theme attribute when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Maintain video playback continuity
  useEffect(() => {
    if (videoRef.current && !is3DPage) {
      const video = videoRef.current;
      
      const maintainPlayback = () => {
        if (!video.paused) {
          // Video is playing, maintain playback
          return;
        }
        
        // Try to resume playback if it was paused due to theme change
        video.play().catch((error) => {
          console.warn('Could not resume video playback:', error);
        });
      };

      // Check playback state after a short delay
      const playbackCheck = setTimeout(maintainPlayback, 200);
      
      return () => clearTimeout(playbackCheck);
    }
  }, [mode, currentVideo, is3DPage]);

  // Monitor video progress and ensure continuous looping
  useEffect(() => {
    if (videoRef.current && !is3DPage && isHome) {
      const video = videoRef.current;
      
      const handleTimeUpdate = () => {
        // Check if video is near end and prepare next video
        if (video.currentTime > 0 && video.duration > 0) {
          const timeRemaining = video.duration - video.currentTime;
          if (timeRemaining < 1) {
            // Prepare for smooth transition
            console.log(`Video ${videoFiles[currentVideo]} ending soon`);
          }
        }
      };

      const handleLoadStart = () => {
        console.log(`Loading video: ${videoFiles[currentVideo]}`);
      };

      const handleCanPlay = () => {
        console.log(`Video can play: ${videoFiles[currentVideo]}`);
        if (video.paused) {
          video.play().catch(console.warn);
        }
      };

      const handleStalled = () => {
        console.warn(`Video stalled: ${videoFiles[currentVideo]}`);
        // Try to continue playback
        setTimeout(() => {
          if (video.paused) {
            video.play().catch(console.warn);
          }
        }, 1000);
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('stalled', handleStalled);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('stalled', handleStalled);
      };
    }
  }, [currentVideo, is3DPage, isHome]);

  // Failsafe video loop mechanism
  useEffect(() => {
    if (videoRef.current && !is3DPage && isHome) {
      const video = videoRef.current;
      
      const checkVideoLoop = () => {
        if (video.ended) {
          console.log(`Video ${videoFiles[currentVideo]} has ended, triggering loop`);
          handleVideoEnd();
        }
      };

      // Check every 500ms if video has ended (failsafe)
      const interval = setInterval(checkVideoLoop, 500);
      
      return () => clearInterval(interval);
    }
  }, [currentVideo, is3DPage, isHome, handleVideoEnd]);

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
      fontFamily: 'Inter, Poppins, system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 900, letterSpacing: '0.5px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      h2: { fontWeight: 800, letterSpacing: '0.5px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      h3: { fontWeight: 700, letterSpacing: '0.25px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      h4: { fontWeight: 700, letterSpacing: '0.25px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      h5: { fontWeight: 600, letterSpacing: '0.1px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      h6: { fontWeight: 600, letterSpacing: '0.1px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      button: { fontWeight: 600, letterSpacing: '0.5px', fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      body1: { fontWeight: 400, lineHeight: 1.6, fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
      body2: { fontWeight: 400, lineHeight: 1.5, fontFamily: 'Inter, Poppins, system-ui, sans-serif' },
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
              onLoadedData={() => {
                // Ensure video plays when loaded
                if (videoRef.current) {
                  console.log(`Video loaded: ${videoFiles[currentVideo]}`);
                  videoRef.current.play().catch(console.warn);
                }
              }}
              onPause={(e) => {
                // Prevent unwanted pausing except during video transitions
                const video = e.target as HTMLVideoElement;
                if (!video.ended && !video.seeking) {
                  setTimeout(() => {
                    if (!video.ended) {
                      video.play().catch(console.warn);
                    }
                  }, 100);
                }
              }}
              onError={(e) => {
                console.error(`Error loading video: ${videoFiles[currentVideo]}`, e);
                // Try to move to next video on error
                handleVideoEnd();
              }}
              playsInline
              preload="auto"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: 0,
                filter: `brightness(var(--video-brightness)) contrast(var(--video-contrast)) saturate(var(--video-saturation))`,
                pointerEvents: 'none',
                transition: 'filter 0.3s ease-in-out',
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
                background: mode === 'dark' 
                  ? 'rgba(24, 18, 43, 0.65)' 
                  : 'rgba(255, 255, 255, 0.25)',
                pointerEvents: 'none',
                transition: 'background 0.3s ease-in-out',
              }}
            />
          )}
          {/* Main app content overlays video and overlay */}
          <Box sx={{ minHeight: '100vh', bgcolor: isHome || !is3DPage ? 'transparent' : 'background.default', color: 'text.primary', position: 'relative', zIndex: 2 }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(34,34,54,0.95) 0%, rgba(25,118,210,0.15) 50%, rgba(123,31,162,0.25) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(25,118,210,0.08) 50%, rgba(123,31,162,0.12) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent, rgba(255,255,255,0.05))',
              pointerEvents: 'none',
            }
          }}>
            <Toolbar sx={{
              display: 'flex',
              flexWrap: 'wrap',
              minHeight: 80,
              px: { xs: 2, md: 4 },
              py: 1.5,
              alignItems: 'center',
              gap: 3,
              position: 'relative',
              zIndex: 1,
            }}>
              <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2, display: { xs: 'block', md: 'none' } }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ 
                flexGrow: 0, 
                fontFamily: 'Inter, Poppins, system-ui, sans-serif',
                fontWeight: 800, 
                fontSize: '1.5rem',
                letterSpacing: '0.5px', 
                mr: 4, 
                display: 'flex', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: 'gradient 10s ease infinite',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <img 
                  src={TuneSphereLogo} 
                  alt="TuneSphere Logo" 
                  style={{ 
                    height: 42, 
                    marginRight: 12, 
                    verticalAlign: 'middle',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'transform 0.3s ease',
                  }} 
                  onMouseEnter={(e) => e.target.style.transform = 'rotate(5deg) scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg) scale(1)'}
                />
                TuneSphere
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: 'none', md: 'block' },
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  maxWidth: '80vw',
                  minWidth: 0,
                  scrollBehavior: 'smooth',
                  scrollbarColor: mode === 'dark' ? '#7b1fa2 #231942' : '#7b1fa2 #f0f0f0',
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(90deg, #7b1fa2, #42a5f5)',
                    borderRadius: 4,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #9c27b0, #1976d2)',
                    }
                  },
                  '&::-webkit-scrollbar-track': {
                    background: mode === 'dark' ? '#231942' : '#f0f0f0',
                    borderRadius: 4,
                  },
                  py: 1,
                  px: 1,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 20,
                    background: `linear-gradient(90deg, transparent, ${mode === 'dark' ? 'rgba(34,34,54,0.95)' : 'rgba(255,255,255,0.95)'})`,
                    pointerEvents: 'none',
                    zIndex: 1,
                  }
                }}
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, minWidth: 'max-content' }}>
                  {/* Render all nav sections and items, grouped with section labels */}
                  {navCategories.map((section) => (
                    <Box key={section.title} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mr: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                        {section.title}
                      </Typography>
                      {section.items.map((item) => (
                        <Button
                          key={item.label}
                          color="inherit"
                          component={RouterLink}
                          to={item.to}
                          startIcon={item.icon}
                          className="modern-nav-button"
                          sx={{
                            fontFamily: 'Inter, Poppins, system-ui, sans-serif',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            px: 3,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '0.95rem',
                            background: mode === 'dark' 
                              ? 'rgba(255,255,255,0.05)' 
                              : 'rgba(0,0,0,0.05)',
                            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            '&:hover': {
                              background: mode === 'dark' 
                                ? 'rgba(255,255,255,0.12)' 
                                : 'rgba(0,0,0,0.08)',
                              borderColor: mode === 'dark' 
                                ? 'rgba(255,255,255,0.2)' 
                                : 'rgba(0,0,0,0.15)',
                              transform: 'translateY(-3px) scale(1.02)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                              opacity: 0,
                              transition: 'opacity 0.3s ease',
                            },
                            '&:hover::before': {
                              opacity: 1,
                            },
                            ...(item.label === '3D Home' && {
                              color: 'white',
                              fontWeight: 700,
                            })
                          }}
                        >
                          {item.label}
                          {item.label === 'Notifications' && unreadCount > 0 ? (
                            <Chip
                              label={unreadCount}
                              size="small"
                              sx={{
                                ml: 1,
                                height: 18,
                                fontSize: '0.7rem',
                                backgroundColor: 'error.main',
                                color: 'white',
                                fontWeight: 700,
                                letterSpacing: 0.5
                              }}
                            />
                          ) : item.badge && (
                            <Chip
                              label={item.badge}
                              size="small"
                              sx={{
                                ml: 1,
                                height: 18,
                                fontSize: '0.7rem',
                                backgroundColor: 'success.main',
                                color: 'white',
                                fontWeight: 700,
                                letterSpacing: 0.5
                              }}
                            />
                          )}
                        </Button>
                      ))}
                    </Box>
                  ))}
                  {/* Admin section in AppBar */}
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main', mr: 1, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                      ADMIN
                    </Typography>
                    {adminLinks.map((link) => (
                      <Button
                        key={link.label}
                        color="inherit"
                        component={RouterLink}
                        to={link.to}
                        startIcon={link.icon}
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
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            background: 'rgba(25,118,210,0.13)',
                            color: 'primary.main',
                            transform: 'translateY(-2px) scale(1.04)',
                            boxShadow: '0 4px 16px 0 rgba(25,118,210,0.10)',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {link.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
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