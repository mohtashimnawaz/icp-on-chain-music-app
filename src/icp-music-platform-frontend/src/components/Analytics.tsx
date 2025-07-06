import React, { useEffect, useState } from 'react';
import { getPlatformAnalytics, getRevenueInsights, getTrackPerformanceMetrics, listTracks } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [trackMetrics, setTrackMetrics] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const analyticsPromise = (async () => {
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
          showMessage('Failed to fetch analytics data', 'error');
        }
      })();
      
      await withLoading(analyticsPromise, 'Loading analytics...');
    };
    fetchAnalytics();
  }, [withLoading, showMessage]);

  const handleTrackSelect = async (trackId: string) => {
    setSelectedTrack(trackId);
    setTrackMetrics(null);
    if (!trackId) return;
    
    const metricsPromise = (async () => {
      try {
        const metrics = await getTrackPerformanceMetrics(BigInt(trackId));
        setTrackMetrics(metrics);
      } catch {
        setTrackMetrics(null);
        showMessage('Failed to load track metrics', 'error');
      }
    })();
    
    await withLoading(metricsPromise, 'Loading track metrics...');
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!stats) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info">No analytics data available.</Alert>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Platform Analytics
      </Typography>

      {/* Platform Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <MusicNoteIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.total_tracks || 0}</Typography>
              <Typography variant="body2">Total Tracks</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ background: 'linear-gradient(135deg, #388e3c, #66bb6a)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.total_users || 0}</Typography>
              <Typography variant="body2">Total Users</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f57c00, #ff9800)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.total_plays || 0}</Typography>
              <Typography variant="body2">Total Plays</Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2, #9c27b0)' }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <MonetizationOnIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.total_revenue || 0}</Typography>
              <Typography variant="body2">Total Revenue</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Stats */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1 }} />
              Platform Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Total Artists" 
                  secondary={stats.total_artists || 0}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Average Track Rating" 
                  secondary={`${stats.avg_track_rating || 0}/5`}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Genres
            </Typography>
            {stats.most_popular_genres && stats.most_popular_genres.length > 0 ? (
              <List>
                {stats.most_popular_genres.map((genre: any, i: number) => (
                  <ListItem key={i}>
                    <ListItemText 
                      primary={genre[0]} 
                      secondary={`${genre[1]} tracks`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No genre data available.</Alert>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Revenue Insights */}
      {revenue && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Revenue Insights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Earning Tracks
                </Typography>
                {revenue.top_earning_tracks && revenue.top_earning_tracks.length > 0 ? (
                  <List>
                    {revenue.top_earning_tracks.map((track: any, i: number) => (
                      <ListItem key={i}>
                        <ListItemText 
                          primary={`Track ${track[0]}`} 
                          secondary={`Revenue: ${track[1]}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No track revenue data.</Alert>
                )}
              </Paper>
            </Box>

            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top Earning Artists
                </Typography>
                {revenue.top_earning_artists && revenue.top_earning_artists.length > 0 ? (
                  <List>
                    {revenue.top_earning_artists.map((artist: any, i: number) => (
                      <ListItem key={i}>
                        <ListItemText 
                          primary={`Artist ${artist[0]}`} 
                          secondary={`Revenue: ${artist[1]}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">No artist revenue data.</Alert>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Track Performance Metrics */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Track Performance Metrics
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Track</InputLabel>
            <Select
              value={selectedTrack}
              label="Select Track"
              onChange={(e) => handleTrackSelect(e.target.value)}
            >
              <MenuItem value="">
                <em>-- Select a track --</em>
              </MenuItem>
              {tracks.map((track: any) => (
                <MenuItem key={track.id.toString()} value={track.id.toString()}>
                  {track.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {trackLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {trackMetrics && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">{trackMetrics.total_plays || 0}</Typography>
                    <Typography variant="body2">Total Plays</Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">{trackMetrics.unique_listeners || 0}</Typography>
                    <Typography variant="body2">Unique Listeners</Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">{trackMetrics.avg_rating || 0}</Typography>
                    <Typography variant="body2">Avg Rating</Typography>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <MonetizationOnIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">{trackMetrics.total_revenue || 0}</Typography>
                    <Typography variant="body2">Total Revenue</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Analytics; 