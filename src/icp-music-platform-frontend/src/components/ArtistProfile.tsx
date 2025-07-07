import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArtist, updateArtist, followArtist, unfollowArtist, getUserEngagementMetrics, searchTracksByContributor, listFollowedArtists, reportContent } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';
import ReportModal from './ReportModal';
import type { ReportTargetType } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ReportIcon from '@mui/icons-material/Report';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

type LocalArtist = {
  id: bigint;
  name: string;
  bio: string;
  social: string;
  profile_image_url?: string;
  links?: string[];
  user_principal?: any;
};

const ARTIST_TARGET_TYPE: ReportTargetType = { Artist: null };

const ArtistProfile: React.FC = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<LocalArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({ name: '', bio: '', social: '', profileImageUrl: '', links: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportError, setReportError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    const fetchArtist = async () => {
      const fetchPromise = (async () => {
        setError(null);
        try {
          const data = await getArtist(BigInt(id!));
          if (data && data[0]) {
            const artistData = data[0] as any;
            // Normalize all fields for LocalArtist
            const social = Array.isArray(artistData.social) && artistData.social.length > 0 ? artistData.social[0] : '';
            const profileImageUrl = Array.isArray(artistData.profile_image_url) && artistData.profile_image_url.length > 0 ? artistData.profile_image_url[0] : undefined;
            const linksArr = Array.isArray(artistData.links) && artistData.links.length > 0 && Array.isArray(artistData.links[0]) ? artistData.links[0] : undefined;
            const userPrincipal = artistData.user_principal ? artistData.user_principal : undefined;
            const normalizedArtist: LocalArtist = {
              id: artistData.id,
              name: artistData.name,
              bio: artistData.bio,
              social,
              profile_image_url: profileImageUrl,
              links: linksArr,
              user_principal: userPrincipal
            };
            setArtist(normalizedArtist);
            setFields({
              name: artistData.name,
              bio: artistData.bio,
              social,
              profileImageUrl: profileImageUrl || '',
              links: linksArr ? linksArr.join(', ') : ''
            });
          } else {
            setError('Artist not found.');
          }
          // Fetch tracks by this artist
          const tracksData = await searchTracksByContributor(BigInt(id!));
          setTracks(tracksData);
          // Fetch analytics
          const analyticsData = await getUserEngagementMetrics(BigInt(id!));
          setAnalytics(analyticsData && analyticsData[0] ? analyticsData[0] : null);
          // Fetch followed artists for current user (demo: just check if artist id is in list)
          const followed = await listFollowedArtists();
          setIsFollowing(Array.isArray(followed) && followed.some((p: any) => artist && artist.user_principal && p.toString() === artist.user_principal.toString()));
          // For demo, set followers/following from analytics if available
          if (analyticsData && analyticsData[0]) {
            setFollowers(Number(analyticsData[0].followers_count || 0));
            setFollowing(Number(analyticsData[0].following_count || 0));
          }
        } catch (e) {
          setError('Failed to load artist.');
          showMessage('Failed to load artist profile', 'error');
        }
      })();
      
      await withLoading(fetchPromise, 'Loading artist profile...');
    };
    fetchArtist();
  }, [id, withLoading, showMessage]);

  const handleEdit = () => setEditDialogOpen(true);
  const handleCancel = () => setEditDialogOpen(false);

  const handleChange = (field: string, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const savePromise = (async () => {
      setActionError(null);
      setMessage(null);
      try {
        const linksArr = fields.links.split(',').map(l => l.trim()).filter(Boolean);
        await updateArtist(BigInt(id!), fields.name, fields.bio, fields.social, fields.profileImageUrl, linksArr);
        showMessage('Profile updated successfully!', 'success');
        setEditDialogOpen(false);
        // Refresh artist
        const data = await getArtist(BigInt(id!));
        if (data && data[0]) {
          const artistData = data[0] as any;
          const social = Array.isArray(artistData.social) && artistData.social.length > 0 ? artistData.social[0] : '';
          const profileImageUrl = Array.isArray(artistData.profile_image_url) && artistData.profile_image_url.length > 0 ? artistData.profile_image_url[0] : undefined;
          const linksArr = Array.isArray(artistData.links) && artistData.links.length > 0 && Array.isArray(artistData.links[0]) ? artistData.links[0] : undefined;
          const userPrincipal = artistData.user_principal ? artistData.user_principal : undefined;
          const normalizedArtist: LocalArtist = {
            id: artistData.id,
            name: artistData.name,
            bio: artistData.bio,
            social,
            profile_image_url: profileImageUrl,
            links: linksArr,
            user_principal: userPrincipal
          };
          setArtist(normalizedArtist);
        }
      } catch (e) {
        setActionError('Failed to update profile.');
        showMessage('Failed to update profile', 'error');
      }
    })();
    
    await withLoading(savePromise, 'Updating profile...');
  };

  const handleFollow = async () => {
    if (!artist) return;
    const followPromise = (async () => {
      try {
        await followArtist(artist.user_principal ? artist.user_principal.toString() : '');
        showMessage('Artist followed successfully!', 'success');
        setIsFollowing(true);
        setFollowers(prev => prev + 1);
      } catch (e) {
        showMessage('Failed to follow artist', 'error');
      }
    })();
    
    await withLoading(followPromise, 'Following artist...');
  };

  const handleUnfollow = async () => {
    if (!artist) return;
    const unfollowPromise = (async () => {
      try {
        await unfollowArtist(artist.user_principal ? artist.user_principal.toString() : '');
        showMessage('Artist unfollowed successfully!', 'success');
        setIsFollowing(false);
        setFollowers(prev => Math.max(0, prev - 1));
      } catch (e) {
        showMessage('Failed to unfollow artist', 'error');
      }
    })();
    
    await withLoading(unfollowPromise, 'Unfollowing artist...');
  };

  const handleOpenReport = () => {
    setReportOpen(true);
    setReportError('');
  };

  const handleCloseReport = () => {
    setReportOpen(false);
    setReportError('');
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    if (!artist) return;
    try {
      await reportContent(ARTIST_TARGET_TYPE, artist.id.toString(), reason, details);
      setReportOpen(false);
      showMessage('Report submitted successfully', 'success');
    } catch {
      setReportError('Failed to submit report.');
      showMessage('Failed to submit report', 'error');
    }
  };

  const getSocialIcon = (social: string) => {
    const lowerSocial = social.toLowerCase();
    if (lowerSocial.includes('instagram')) return <InstagramIcon />;
    if (lowerSocial.includes('twitter')) return <TwitterIcon />;
    if (lowerSocial.includes('youtube')) return <YouTubeIcon />;
    if (lowerSocial.includes('facebook')) return <FacebookIcon />;
    return <LinkIcon />;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );
  
  if (!artist) return null;
  
  const safeArtist = artist as LocalArtist;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={safeArtist.profile_image_url}
              sx={{ 
                width: 120, 
                height: 120, 
                mr: 3,
                border: '4px solid rgba(255,255,255,0.3)'
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {safeArtist.name || 'Unknown Artist'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Artist #{safeArtist.id.toString()}
              </Typography>
              {safeArtist.bio && (
                <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600 }}>
                  {safeArtist.bio}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={isFollowing ? <RemoveIcon /> : <AddIcon />}
              onClick={isFollowing ? handleUnfollow : handleFollow}
              sx={{ 
                bgcolor: isFollowing ? 'error.main' : 'success.main',
                '&:hover': { bgcolor: isFollowing ? 'error.dark' : 'success.dark' }
              }}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={handleOpenReport}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Report
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
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
          <CardContent sx={{ textAlign: 'center', color: 'white' }}>
            <MusicNoteIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
            }}>{tracks.length}</Typography>
            <Typography variant="body2">Total Tracks</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
          background: 'linear-gradient(135deg, #42a5f5 0%, #7b1fa2 100%)',
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
          <CardContent sx={{ textAlign: 'center', color: 'white' }}>
            <PeopleIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 2px 8px #7b1fa2)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #7b1fa2',
            }}>{followers}</Typography>
            <Typography variant="body2">Followers</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
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
          <CardContent sx={{ textAlign: 'center', color: 'white' }}>
            <TrendingUpIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
            }}>{following}</Typography>
            <Typography variant="body2">Following</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
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
          <CardContent sx={{ textAlign: 'center', color: 'white' }}>
            <StarIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
            }}>
              {analytics?.avg_track_rating ? Number(analytics.avg_track_rating).toFixed(1) : 'N/A'}
            </Typography>
            <Typography variant="body2">Avg Rating</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Analytics Section */}
      {analytics && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ mr: 1 }} />
              Analytics Overview
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrowIcon color="primary" />
                <Typography variant="body2">
                  <strong>Total Plays:</strong> {analytics.total_plays_received || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="success" />
                <Typography variant="body2">
                  <strong>Revenue:</strong> ${analytics.total_revenue_earned || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MusicNoteIcon color="warning" />
                <Typography variant="body2">
                  <strong>Tracks Created:</strong> {analytics.total_tracks_created || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {(safeArtist.social || (safeArtist.links && safeArtist.links.length > 0)) && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Social Links
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {safeArtist.social && (
                <Chip
                  icon={getSocialIcon(safeArtist.social)}
                  label={safeArtist.social}
                  variant="outlined"
                  clickable
                  onClick={() => window.open(safeArtist.social, '_blank')}
                />
              )}
              {safeArtist.links && safeArtist.links.map((link, index) => (
                <Chip
                  key={index}
                  icon={<LinkIcon />}
                  label={link}
                  variant="outlined"
                  clickable
                  onClick={() => window.open(link, '_blank')}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tracks Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <MusicNoteIcon sx={{ mr: 1 }} />
            Tracks by {safeArtist.name} ({tracks.length})
          </Typography>
          
          {tracks.length === 0 ? (
            <Alert severity="info">
              No tracks found for this artist.
            </Alert>
          ) : (
            <List>
              {tracks.map((track: any, idx: number) => (
                <ListItem key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <MusicNoteIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={track.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {track.description}
                        </Typography>
                        {track.duration && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {formatDuration(Number(track.duration))}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                  >
                    Play
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Profile
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Artist Name"
              value={fields.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Bio"
              value={fields.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Social Media URL"
              value={fields.social || ''}
              onChange={(e) => handleChange('social', e.target.value)}
              margin="normal"
              placeholder="https://instagram.com/artistname"
            />
            <TextField
              fullWidth
              label="Profile Image URL"
              value={fields.profileImageUrl || ''}
              onChange={(e) => handleChange('profileImageUrl', e.target.value)}
              margin="normal"
              placeholder="https://example.com/image.jpg"
            />
            <TextField
              fullWidth
              label="Additional Links (comma-separated)"
              value={fields.links || ''}
              onChange={(e) => handleChange('links', e.target.value)}
              margin="normal"
              placeholder="https://website.com, https://soundcloud.com/artist"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={handleCloseReport}
        onSubmit={handleSubmitReport}
        targetType={ARTIST_TARGET_TYPE}
        targetId={safeArtist.id ? safeArtist.id.toString() : ''}
      />
    </Box>
  );
};

export default ArtistProfile; 