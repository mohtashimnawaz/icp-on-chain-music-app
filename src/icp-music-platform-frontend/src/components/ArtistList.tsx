import React, { useEffect, useState } from 'react';
import { listArtists } from '../services/musicService';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ArtistList: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    const fetchArtists = async () => {
      const artistsPromise = (async () => {
        setError(null);
        try {
          const data = await listArtists();
          setArtists(data);
        } catch (e) {
          setError('Failed to load artists.');
          showMessage('Failed to load artists', 'error');
        }
      })();
      
      await withLoading(artistsPromise, 'Loading artists...');
    };
    fetchArtists();
  }, [withLoading, showMessage]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <MusicNoteIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">
          Discover Artists
        </Typography>
      </Box>

      {artists.length === 0 ? (
        <Alert severity="info">
          No artists found. Be the first to register as an artist!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {artists.map((artist, idx) => (
            <Card 
              key={idx} 
              sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' },
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
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2, boxShadow: '0 2px 8px #42a5f5' }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" component="div" sx={{
                    background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    letterSpacing: 1,
                    textShadow: '0 2px 8px #42a5f5',
                  }}>
                    {artist.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {artist.bio}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                  onClick={() => navigate(`/artists/${artist.id}`)}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ArtistList; 