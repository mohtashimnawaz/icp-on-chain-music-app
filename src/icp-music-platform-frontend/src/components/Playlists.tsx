import React, { useEffect, useState } from 'react';
import { listPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ name: '', description: '', tracks: '' });
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchPlaylists = async () => {
    const playlistsPromise = (async () => {
      setError('');
      try {
        const data = await listPlaylists();
        setPlaylists(data);
      } catch {
        setError('Failed to load playlists.');
        showMessage('Failed to load playlists', 'error');
      }
    })();
    
    await withLoading(playlistsPromise, 'Loading playlists...');
  };

  useEffect(() => { fetchPlaylists(); }, [withLoading, showMessage]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      showMessage('Playlist name is required', 'error');
      return;
    }

    const createPromise = (async () => {
      setError(''); 
      setSuccess('');
      try {
        const trackIds = form.tracks.split(',').map(t => t.trim()).filter(Boolean).map(t => BigInt(t));
        await createPlaylist(form.name, form.description, trackIds);
        setSuccess('Playlist created!');
        showMessage('Playlist created successfully!', 'success');
        setForm({ name: '', description: '', tracks: '' });
        setDialogOpen(false);
        fetchPlaylists();
      } catch { 
        setError('Failed to create playlist.'); 
        showMessage('Failed to create playlist', 'error');
      }
    })();
    
    await withLoading(createPromise, 'Creating playlist...');
  };

  const handleEdit = (pl: any) => {
    setEditingId(pl.id);
    setForm({ 
      name: pl.name, 
      description: pl.description?.[0] || '', 
      tracks: pl.track_ids.join(', ') 
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      showMessage('Playlist name is required', 'error');
      return;
    }

    const updatePromise = (async () => {
      setError(''); 
      setSuccess('');
      try {
        const trackIds = form.tracks.split(',').map(t => t.trim()).filter(Boolean).map(t => BigInt(t));
        await updatePlaylist(editingId!, form.name, form.description, trackIds);
        setSuccess('Playlist updated!');
        showMessage('Playlist updated successfully!', 'success');
        setEditingId(null);
        setForm({ name: '', description: '', tracks: '' });
        setDialogOpen(false);
        fetchPlaylists();
      } catch { 
        setError('Failed to update playlist.'); 
        showMessage('Failed to update playlist', 'error');
      }
    })();
    
    await withLoading(updatePromise, 'Updating playlist...');
  };

  const handleDelete = async (id: bigint) => {
    const deletePromise = (async () => {
      setError(''); 
      setSuccess('');
      try {
        await deletePlaylist(id);
        setSuccess('Playlist deleted!');
        showMessage('Playlist deleted successfully!', 'success');
        fetchPlaylists();
      } catch { 
        setError('Failed to delete playlist.'); 
        showMessage('Failed to delete playlist', 'error');
      }
    })();
    
    await withLoading(deletePromise, 'Deleting playlist...');
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm({ name: '', description: '', tracks: '' });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ name: '', description: '', tracks: '' });
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PlaylistAddIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">
            My Playlists
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Create Playlist
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {playlists.length === 0 ? (
        <Alert severity="info">
          No playlists found. Create your first playlist to get started!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {playlists.map((pl, i) => (
            <Card 
              key={i} 
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
                  <MusicNoteIcon sx={{ mr: 1, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
                  <Typography variant="h6" component="div" sx={{
                    background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    letterSpacing: 1,
                    textShadow: '0 2px 8px #42a5f5',
                  }}>
                    {pl.name}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2 }}
                >
                  {pl.description?.[0] || 'No description'}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {pl.track_ids.length} tracks
                </Typography>
              </CardContent>
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleEdit(pl)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(pl.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Playlist' : 'Create New Playlist'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Playlist Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Track IDs (comma separated)"
              value={form.tracks}
              onChange={(e) => setForm(f => ({ ...f, tracks: e.target.value }))}
              placeholder="1, 2, 3"
              helperText="Enter track IDs separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={editingId ? handleUpdate : handleCreate}
            variant="contained"
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Playlists; 