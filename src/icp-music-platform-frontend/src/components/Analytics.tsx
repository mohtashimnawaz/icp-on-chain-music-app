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
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';

// Simple Bar Chart Component
const SimpleBarChart: React.FC<{ data: Array<[string, number]>, title: string, color?: string }> = ({ data, title, color = '#1976d2' }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(item => item[1]));
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <BarChartIcon sx={{ mr: 1 }} />
        {title}
      </Typography>
      <Box sx={{ mt: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{item[0]}</Typography>
              <Typography variant="body2" fontWeight="bold">{item[1]}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(item[1] / maxValue) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 4,
                }
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// Progress Ring Component
const ProgressRing: React.FC<{ value: number, maxValue: number, label: string, color?: string }> = ({ value, maxValue, label, color = '#1976d2' }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e0e0e0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <Typography variant="h6" fontWeight="bold">{Math.round(percentage)}%</Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">
        {value} / {maxValue}
      </Typography>
    </Box>
  );
};

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
      <Typography variant="h4" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <TrendingUpIcon sx={{ mr: 2, color: 'primary.main' }} />
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

      {/* Progress Rings for Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressRing
                value={stats.avg_track_rating || 0}
                maxValue={5}
                label="Avg Rating"
                color="#ff9800"
              />
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressRing
                value={stats.total_artists || 0}
                maxValue={Math.max(stats.total_artists || 0, 100)}
                label="Active Artists"
                color="#4caf50"
              />
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressRing
                value={stats.total_plays || 0}
                maxValue={Math.max(stats.total_plays || 0, 1000)}
                label="Total Plays"
                color="#2196f3"
              />
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressRing
                value={stats.total_revenue || 0}
                maxValue={Math.max(stats.total_revenue || 0, 1000)}
                label="Total Revenue"
                color="#9c27b0"
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Stats with Charts */}
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
          <SimpleBarChart
            data={stats.most_popular_genres || []}
            title="Top Genres"
            color="#4caf50"
          />
        </Box>
      </Box>

      {/* Revenue Insights with Charts */}
      {revenue && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <MonetizationOnIcon sx={{ mr: 1 }} />
            Revenue Insights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <SimpleBarChart
                data={revenue.top_earning_tracks || []}
                title="Top Earning Tracks"
                color="#ff9800"
              />
            </Box>

            <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
              <SimpleBarChart
                data={revenue.top_earning_artists || []}
                title="Top Earning Artists"
                color="#9c27b0"
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Track Performance Metrics */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <PlayArrowIcon sx={{ mr: 1 }} />
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