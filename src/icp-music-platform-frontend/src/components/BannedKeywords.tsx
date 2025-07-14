import React, { useEffect, useState } from 'react';
import { listBannedKeywords } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BlockIcon from '@mui/icons-material/Block';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';

const BannedKeywords: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    const fetchPromise = (async () => {
      setError(null);
      setLoading(true);
      try {
        const list = await listBannedKeywords();
        setKeywords(list);
      } catch (error) {
        setError('Failed to load keywords.');
        showMessage('Failed to load banned keywords', 'error');
      } finally {
        setLoading(false);
      }
    })();
    
    await withLoading(fetchPromise, 'Loading banned keywords...');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
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
        mb: 4
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BlockIcon sx={{ fontSize: 40, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              color: '#fff',
              fontWeight: 900,
              ml: 2,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontSize: { xs: '1.5rem', md: '2.125rem' }
            }}>
              Content Moderation
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#fff', opacity: 0.9, fontSize: '1.1rem' }}>
            View currently banned keywords for content moderation. Admin functions are managed backend-only for security.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Read-only Banned Keywords List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            Banned Keywords ({keywords.length})
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            These keywords are automatically filtered from user content. Management is handled through backend administration.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={fetchKeywords}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            sx={{ mb: 3 }}
          >
            Refresh List
          </Button>

          {keywords.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body1" color="text.secondary">
                No banned keywords configured
              </Typography>
            </Paper>
          ) : (
            <List>
              {keywords.map((keyword, index) => (
                <ListItem key={keyword} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={keyword}
                          color="error"
                          variant="outlined"
                          icon={<BlockIcon />}
                          sx={{ mr: 2 }}
                        />
                      </Box>
                    }
                    secondary={`Banned keyword #${index + 1}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BannedKeywords;