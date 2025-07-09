import React, { useState, useRef, useEffect } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';

// MUI imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url?: string;
  cover?: string;
}

const MusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [playlist, setPlaylist] = useState<Track[]>([
    {
      id: '1',
      title: 'Sample Track 1',
      artist: 'Artist One',
      duration: 180,
      cover: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      title: 'Sample Track 2',
      artist: 'Artist Two',
      duration: 240,
      cover: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      title: 'Sample Track 3',
      artist: 'Artist Three',
      duration: 200,
      cover: 'https://via.placeholder.com/150'
    }
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentTrack(playlist[currentTrackIndex]);
    }
  }, [playlist, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!currentTrack) {
      showMessage('No track selected', 'warning');
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(playlist.length - 1);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const handleTimeChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    showMessage(isShuffled ? 'Shuffle disabled' : 'Shuffle enabled', 'info');
  };

  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    showMessage(`Repeat: ${nextMode}`, 'info');
  };

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
      showMessage('Removed from favorites', 'info');
    } else {
      newFavorites.add(trackId);
      showMessage('Added to favorites', 'success');
    }
    setFavorites(newFavorites);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <MusicNoteIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">
          Music Player
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Main Player */}
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
              <MusicNoteIcon sx={{ fontSize: 32, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
              <Typography variant="h6" sx={{
                color: '#fff',
                fontWeight: 800,
                letterSpacing: 1,
                ml: 1
              }}>
                Now Playing
              </Typography>
            </Box>
            {/* Album Cover */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  mx: 'auto',
                  borderRadius: 2,
                  background: currentTrack?.cover || 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                {!currentTrack?.cover && (
                  <MusicNoteIcon sx={{ fontSize: 80, color: 'white' }} />
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {currentTrack?.title || 'No track selected'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTrack?.artist || 'Unknown Artist'}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Slider
                value={currentTime}
                max={duration}
                onChange={(_, value) => handleTimeChange(value as number)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <IconButton onClick={toggleShuffle} color={isShuffled ? 'primary' : 'default'}>
                <ShuffleIcon />
              </IconButton>
              <IconButton onClick={handlePrevious} sx={{ mx: 1 }}>
                <SkipPreviousIcon />
              </IconButton>
              <IconButton 
                onClick={togglePlay} 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton onClick={handleNext} sx={{ mx: 1 }}>
                <SkipNextIcon />
              </IconButton>
              <IconButton onClick={toggleRepeat} color={repeatMode !== 'none' ? 'primary' : 'default'}>
                <RepeatIcon />
              </IconButton>
            </Box>

            {/* Volume Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={toggleMute}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume}
                onChange={(_, value) => handleVolumeChange(value as number)}
                sx={{ ml: 2 }}
              />
            </Box>

            {/* Favorite Button */}
            {currentTrack && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <IconButton 
                  onClick={() => toggleFavorite(currentTrack.id)}
                  color={favorites.has(currentTrack.id) ? 'error' : 'default'}
                >
                  {favorites.has(currentTrack.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Playlist */}
        <Paper sx={{ flex: 1, maxHeight: 600, overflow: 'auto' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              Playlist ({playlist.length} tracks)
            </Typography>
          </Box>
          <List>
            {playlist.map((track, index) => (
              <ListItem 
                key={track.id}
                onClick={() => selectTrack(index)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: index === currentTrackIndex ? 'primary.light' : 'transparent',
                  '&:hover': { 
                    bgcolor: index === currentTrackIndex ? 'primary.light' : 'action.hover' 
                  }
                }}
              >
                <ListItemText
                  primary={track.title}
                  secondary={`${track.artist} • ${formatTime(track.duration)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id);
                    }}
                    color={favorites.has(track.id) ? 'error' : 'default'}
                  >
                    {favorites.has(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </Box>
  );
};

export default MusicPlayer; 