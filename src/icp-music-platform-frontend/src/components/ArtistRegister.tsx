import React, { useState } from 'react';
import { registerArtist } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const steps = ['Basic Information', 'Social Links', 'Profile Image', 'Review & Submit'];

const ArtistRegister: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [social, setSocial] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [links, setLinks] = useState(''); // comma-separated
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<string | null>(null);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 0: // Basic Information
        if (!name.trim()) newErrors.name = 'Artist name is required';
        if (!bio.trim()) newErrors.bio = 'Bio is required';
        if (bio.length < 10) newErrors.bio = 'Bio must be at least 10 characters';
        break;
      case 1: // Social Links
        if (social && !isValidUrl(social)) newErrors.social = 'Please enter a valid URL';
        break;
      case 2: // Profile Image
        if (profileImageUrl && !isValidUrl(profileImageUrl)) newErrors.profileImageUrl = 'Please enter a valid image URL';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRegister = async () => {
    if (!name || !bio) {
      showMessage('Name and bio are required', 'error');
      return;
    }

    const registerPromise = (async () => {
      try {
        const linksArr = links.split(',').map(l => l.trim()).filter(Boolean);
        await registerArtist(name, bio, social, profileImageUrl, linksArr);
        showMessage('Artist registered successfully! Welcome to the platform!', 'success');
        
        // Reset form
        setName('');
        setBio('');
        setSocial('');
        setProfileImageUrl('');
        setLinks('');
        setActiveStep(0);
        setErrors({});
      } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
      }
    })();
    
    await withLoading(registerPromise, 'Registering artist...');
  };

  const getSocialIcon = (social: string) => {
    const lowerSocial = social.toLowerCase();
    if (lowerSocial.includes('instagram')) return <InstagramIcon />;
    if (lowerSocial.includes('twitter')) return <TwitterIcon />;
    if (lowerSocial.includes('youtube')) return <YouTubeIcon />;
    if (lowerSocial.includes('facebook')) return <FacebookIcon />;
    return <LinkIcon />;
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ mr: 1 }} />
              Tell us about yourself
            </Typography>
            <TextField
              fullWidth
              label="Artist Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              placeholder="Enter your artist name"
            />
            <TextField
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              error={!!errors.bio}
              helperText={errors.bio || 'Tell us about your music and style (minimum 10 characters)'}
              margin="normal"
              multiline
              rows={4}
              placeholder="Share your story, musical journey, and what makes your sound unique..."
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LinkIcon sx={{ mr: 1 }} />
              Connect your social media
            </Typography>
            <TextField
              fullWidth
              label="Primary Social Media URL"
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              error={!!errors.social}
              helperText={errors.social || 'Your main social media profile (Instagram, Twitter, YouTube, etc.)'}
              margin="normal"
              placeholder="https://instagram.com/yourartistname"
            />
            <TextField
              fullWidth
              label="Additional Links (comma-separated)"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              margin="normal"
              placeholder="https://website.com, https://soundcloud.com/artist"
              helperText="Optional: Add your website, SoundCloud, or other platforms"
            />
            {(social || links) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {social && (
                    <Chip
                      icon={getSocialIcon(social)}
                      label={social}
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  {links.split(',').map((link, index) => {
                    const trimmedLink = link.trim();
                    return trimmedLink ? (
                      <Chip
                        key={index}
                        icon={<LinkIcon />}
                        label={trimmedLink}
                        variant="outlined"
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <StarIcon sx={{ mr: 1 }} />
              Profile Image
            </Typography>
            <TextField
              fullWidth
              label="Profile Image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              error={!!errors.profileImageUrl}
              helperText={errors.profileImageUrl || 'Optional: Add a profile picture URL'}
              margin="normal"
              placeholder="https://example.com/your-photo.jpg"
            />
            {profileImageUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <Avatar
                  src={profileImageUrl}
                  sx={{ width: 100, height: 100, mx: 'auto', border: '2px solid', borderColor: 'divider' }}
                >
                  <PersonIcon sx={{ fontSize: 50 }} />
                </Avatar>
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Review your information
            </Typography>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={profileImageUrl}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{name || 'Artist Name'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Artist #{Math.floor(Math.random() * 10000)}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" paragraph>
                  <strong>Bio:</strong> {bio || 'No bio provided'}
                </Typography>
                {social && (
                  <Typography variant="body2" paragraph>
                    <strong>Social:</strong> {social}
                  </Typography>
                )}
                {links && (
                  <Typography variant="body2" paragraph>
                    <strong>Additional Links:</strong> {links}
                  </Typography>
                )}
              </CardContent>
            </Card>
            <Alert severity="info">
              Ready to join the platform? Click "Register Artist" to complete your registration.
            </Alert>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
              <MusicNoteIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" gutterBottom>
              Register as Artist
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our music platform and start sharing your talent with the world
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleRegister}
                  startIcon={<CheckCircleIcon />}
                  size="large"
                >
                  Register Artist
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ArtistRegister; 