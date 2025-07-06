import React, { useEffect, useState } from 'react';
import { listFollowedTracks, getTrack, unfollowTrack } from '../services/musicService';
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
import IconButton from '@mui/material/IconButton';

import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';

const FollowedTracks: React.FC = () => {
  const [trackIds, setTrackIds] = useState<bigint[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    fetchFollowed();
  }, []);

  const fetchFollowed = async () => {
    const fetchPromise = (async () => {
      setError(null);
      try {
        const ids = await listFollowedTracks();
        const arr = Array.isArray(ids) ? ids : Array.from(ids);
        setTrackIds(arr);
        
        if (arr.length > 0) {
          const trackObjs = await Promise.all(arr.map(async (id: bigint) => {
            const t = await getTrack(id);
            return t && t[0] ? t[0] : null;
          }));
          setTracks(trackObjs.filter(Boolean));
        } else {
          setTracks([]);
        }
      } catch (error) {
        setError('Failed to load followed tracks.');
        showMessage('Failed to load followed tracks', 'error');
      }
    })();
    
    await withLoading(fetchPromise, 'Loading followed tracks...');
  };

  const handleUnfollow = async (trackId: bigint) => {
    const unfollowPromise = (async () => {
      try {
        await unfollowTrack(trackId);
        showMessage('Track unfollowed successfully!', 'success');
        fetchFollowed();
      } catch (error) {
        showMessage('Failed to unfollow track', 'error');
      }
    })();
    
    await withLoading(unfollowPromise, 'Unfollowing track...');
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <FavoriteIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">
          Followed Tracks
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : tracks.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FavoriteBorderIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Followed Tracks
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start following tracks to see them here. Discover new music and keep track of your favorites!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
          {tracks.map((track: any) => (
            <Box key={track.id.toString()}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Track Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <MusicNoteIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {track.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Track #{track.id.toString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Track Details */}
                  <Box sx={{ mb: 2 }}>
                    {track.genre && track.genre[0] && (
                      <Chip
                        label={track.genre[0]}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                    
                    {track.duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(Number(track.duration))}
                        </Typography>
                      </Box>
                    )}

                    {track.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StarIcon sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {Number(track.rating).toFixed(1)}/5.0
                        </Typography>
                      </Box>
                    )}

                    {track.created_at && (
                      <Typography variant="caption" color="text.secondary">
                        Added: {formatDate(track.created_at)}
                      </Typography>
                    )}
                  </Box>

                  {/* Contributors */}
                  {track.contributors && track.contributors.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Contributors:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {track.contributors.slice(0, 3).map((contributor: bigint, index: number) => (
                          <Chip
                            key={index}
                            icon={<PersonIcon />}
                            label={`Artist ${contributor.toString()}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {track.contributors.length > 3 && (
                          <Chip
                            label={`+${track.contributors.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    variant="outlined"
                    color="primary"
                  >
                    Play
                  </Button>
                  <Button
                    size="small"
                    startIcon={<FavoriteIcon />}
                    variant="contained"
                    color="error"
                    onClick={() => handleUnfollow(track.id)}
                    disabled={loading}
                  >
                    Unfollow
                  </Button>
                </CardActions>
                             </Card>
             </Box>
           ))}
         </Box>
      )}
    </Box>
  );
};

export default FollowedTracks; 