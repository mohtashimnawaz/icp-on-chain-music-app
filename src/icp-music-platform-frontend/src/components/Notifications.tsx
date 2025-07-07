import React, { useEffect, useState } from 'react';
import { listNotifications, markNotificationRead } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [marking, setMarking] = useState<bigint | null>(null);
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchNotifications = async () => {
    const notificationsPromise = (async () => {
      setError('');
      try {
        const data = await listNotifications();
        setNotifications(data);
      } catch {
        setError('Failed to load notifications.');
        showMessage('Failed to load notifications', 'error');
      }
    })();
    
    await withLoading(notificationsPromise, 'Loading notifications...');
  };

  useEffect(() => { fetchNotifications(); }, [withLoading, showMessage]);

  const handleMarkRead = async (id: bigint) => {
    const markPromise = (async () => {
      setError(''); 
      setSuccess('');
      try {
        await markNotificationRead(id);
        setSuccess('Notification marked as read.');
        showMessage('Notification marked as read', 'success');
        fetchNotifications();
      } catch { 
        setError('Failed to mark as read.'); 
        showMessage('Failed to mark notification as read', 'error');
      }
    })();
    
    await withLoading(markPromise, 'Marking as read...');
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      showMessage('No unread notifications', 'info');
      return;
    }

    const markAllPromise = (async () => {
      setError(''); 
      setSuccess('');
      try {
        await Promise.all(unreadNotifications.map(n => markNotificationRead(n.id)));
        setSuccess('All notifications marked as read.');
        showMessage('All notifications marked as read', 'success');
        fetchNotifications();
      } catch { 
        setError('Failed to mark all as read.'); 
        showMessage('Failed to mark all notifications as read', 'error');
      }
    })();
    
    await withLoading(markAllPromise, 'Marking all as read...');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress />
    </Box>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Card sx={{
            background: 'linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease-in-out infinite',
            boxShadow: '0 8px 32px 0 rgba(123,31,162,0.18)',
            borderRadius: 4,
            transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              transform: 'translateY(-4px) scale(1.04)',
              boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
            },
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ fontSize: 32, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
                <Typography variant="h6" sx={{
                  background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  letterSpacing: 1,
                  textShadow: '0 2px 8px #42a5f5',
                  ml: 1
                }}>
                  Notifications
                </Typography>
              </Box>
              {unreadCount > 0 && (
                <Chip 
                  label={unreadCount} 
                  color="error" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<CheckCircleIcon />}
            onClick={markAllAsRead}
            sx={{ borderRadius: 2 }}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {notifications.length === 0 ? (
        <Alert severity="info">
          No notifications found. You're all caught up!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map((notification, i) => (
            <Card 
              key={i} 
              sx={{ 
                background: 'linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradientMove 8s ease-in-out infinite',
                boxShadow: '0 8px 32px 0 rgba(123,31,162,0.18)',
                borderRadius: 4,
                transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.04)',
                  boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {notification.read ? (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                      )}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: notification.read ? 'text.primary' : 'primary.main'
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(Number(notification.timestamp) * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {!notification.read && (
                    <Chip 
                      label="New" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </CardContent>
              
              {!notification.read && (
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleMarkRead(notification.id)}
                    disabled={marking === notification.id}
                    variant="outlined"
                    color="primary"
                  >
                    Mark as Read
                  </Button>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Notifications; 