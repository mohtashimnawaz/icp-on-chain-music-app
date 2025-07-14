import React, { useEffect, useState } from 'react';
import { listBannedKeywords, addBannedKeyword, removeBannedKeyword, promoteToAdmin } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';

const BannedKeywords: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
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
      try {
        const list = await listBannedKeywords();
        setKeywords(list);
      } catch (error) {
        setError('Failed to load keywords.');
        showMessage('Failed to load banned keywords', 'error');
      }
    })();
    
    await withLoading(fetchPromise, 'Loading banned keywords...');
  };

  const handleAdd = async () => {
    if (!newKeyword.trim()) {
      showMessage('Please enter a keyword', 'error');
      return;
    }

    const addPromise = (async () => {
      setError(null);
      try {
        const ok = await addBannedKeyword(newKeyword.trim());
        if (ok) {
          showMessage('Keyword added successfully!', 'success');
          setNewKeyword('');
          fetchKeywords();
        } else {
          setError('Failed to add keyword.');
          showMessage('Failed to add keyword', 'error');
        }
      } catch (error) {
        setError('Failed to add keyword.');
        showMessage('Failed to add keyword', 'error');
      }
    })();
    
    await withLoading(addPromise, 'Adding keyword...');
  };

  const handleRemove = async (kw: string) => {
    const removePromise = (async () => {
      setError(null);
      try {
        const ok = await removeBannedKeyword(kw);
        if (ok) {
          showMessage('Keyword removed successfully!', 'success');
          fetchKeywords();
        } else {
          setError('Failed to remove keyword.');
          showMessage('Failed to remove keyword', 'error');
        }
      } catch (error) {
        setError('Failed to remove keyword.');
        showMessage('Failed to remove keyword', 'error');
      }
    })();
    
    await withLoading(removePromise, 'Removing keyword...');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  const handlePromoteToAdmin = async () => {
    const promotePromise = (async () => {
      setError(null);
      try {
        const ok = await promoteToAdmin();
        if (ok) {
          showMessage('Successfully promoted to admin!', 'success');
        } else {
          setError('Failed to promote to admin.');
          showMessage('Failed to promote to admin', 'error');
        }
      } catch (error) {
        setError('Failed to promote to admin.');
        showMessage('Failed to promote to admin', 'error');
      }
    })();
    
    await withLoading(promotePromise, 'Promoting to admin...');
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
              letterSpacing: 1,
              ml: 2
            }}>
              Banned Keywords
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Manage banned keywords in a beautiful, immersive admin panel.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Promote to Admin Button */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SecurityIcon sx={{ mr: 1 }} />
            Admin Access Required
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            You need admin privileges to add banned keywords. Click below to promote yourself to admin (for development purposes).
          </Typography>
          <Button
            variant="contained"
            onClick={handlePromoteToAdmin}
            startIcon={<SecurityIcon />}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Promote to Admin
          </Button>
        </CardContent>
      </Card>

      {/* Add New Keyword */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            Add New Banned Keyword
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              label="Keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter keyword to ban"
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={loading || !newKeyword.trim()}
              startIcon={<AddIcon />}
              sx={{ minWidth: 120 }}
            >
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Keywords List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <BlockIcon sx={{ mr: 1 }} />
              Banned Keywords ({keywords.length})
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchKeywords}
              disabled={loading}
              startIcon={<SecurityIcon />}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : keywords.length === 0 ? (
            <Alert severity="info">
              No banned keywords found. Add keywords above to start filtering content.
            </Alert>
          ) : (
            <Paper variant="outlined">
              <List>
                {keywords.map((keyword, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              icon={<BlockIcon />}
                              label={keyword}
                              color="error"
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={`Banned keyword #${index + 1}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemove(keyword)}
                          disabled={loading}
                          title="Remove keyword"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < keywords.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BannedKeywords;