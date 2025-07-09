import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const MusicStudio: React.FC = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
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
            <MusicNoteIcon sx={{ fontSize: 40, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              color: '#fff',
              fontWeight: 900,
              letterSpacing: 1,
              ml: 2
            }}>
              Music Studio
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Create, mix, and master your tracks in a beautiful, immersive studio environment.
          </Typography>
          <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
            (Coming soon: Collaborate in real-time, use virtual instruments, and more!)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MusicStudio; 