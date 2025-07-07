import React, { useEffect, useState } from 'react';
import { listModerationQueue, reviewModerationItem } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';

const ModerationQueue: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<bigint | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    item: any | null;
    action: 'approve' | 'remove' | null;
  }>({
    open: false,
    item: null,
    action: null,
  });
  const [reviewNotes, setReviewNotes] = useState('');

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchQueue = async () => {
    const fetchPromise = (async () => {
      setError('');
      try {
        const data = await listModerationQueue();
        setQueue(data);
      } catch (error) {
        setError('Failed to load moderation queue.');
        showMessage('Failed to load moderation queue', 'error');
      }
    })();
    
    await withLoading(fetchPromise, 'Loading moderation queue...');
  };

  useEffect(() => { 
    fetchQueue(); 
  }, [withLoading, showMessage]);

  const handleReview = async (id: bigint, status: any, notes?: string) => {
    const reviewPromise = (async () => {
      try {
        await reviewModerationItem(id, status, notes);
        showMessage('Moderation item updated successfully!', 'success');
        fetchQueue();
        setReviewDialog({ open: false, item: null, action: null });
        setReviewNotes('');
      } catch (error) {
        showMessage('Failed to update moderation item', 'error');
      }
    })();
    
    await withLoading(reviewPromise, 'Updating moderation item...');
  };

  const openReviewDialog = (item: any, action: 'approve' | 'remove') => {
    setReviewDialog({ open: true, item, action });
    setReviewNotes('');
  };

  const closeReviewDialog = () => {
    setReviewDialog({ open: false, item: null, action: null });
    setReviewNotes('');
  };

  const confirmReview = () => {
    if (!reviewDialog.item) return;
    
    const status = reviewDialog.action === 'approve' 
      ? { Approved: null } 
      : { Removed: null };
    
    handleReview(reviewDialog.item.id, status, reviewNotes || undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Removed': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Track': return <VisibilityIcon />;
      case 'Artist': return <EditIcon />;
      case 'Comment': return <WarningIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Track': return 'primary';
      case 'Artist': return 'secondary';
      case 'Comment': return 'warning';
      default: return 'default';
    }
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
            <FilterListIcon sx={{ fontSize: 40, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
              ml: 2
            }}>
              Moderation Queue
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Review and manage all moderation items in a beautiful, immersive admin panel.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Pending Reviews ({queue.filter(item => Object.keys(item.status)[0] === 'Pending').length})
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchQueue}
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
          ) : queue.length === 0 ? (
            <Alert severity="info">
              No moderation items found in the queue.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Target</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Notes</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {queue.map((item) => {
                    const status = Object.keys(item.status)[0];
                    const type = Object.keys(item.target_type)[0];
                    const isPending = status === 'Pending';
                    
                    return (
                      <TableRow 
                        key={item.id.toString()}
                        sx={{ 
                          '&:hover': { backgroundColor: 'grey.50' },
                          backgroundColor: isPending ? 'warning.light' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.id.toString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getTypeIcon(type)}
                            label={type}
                            color={getTypeColor(type) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.target_id.toString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {item.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            color={getStatusColor(status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 150 }}>
                            {item.notes && item.notes[0] ? item.notes[0] : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                color="success"
                                onClick={() => openReviewDialog(item, 'approve')}
                                disabled={reviewing === item.id}
                                size="small"
                                title="Approve"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => openReviewDialog(item, 'remove')}
                                disabled={reviewing === item.id}
                                size="small"
                                title="Remove"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Reviewed
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialog.open} 
        onClose={closeReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog.action === 'approve' ? 'Approve' : 'Remove'} Item
        </DialogTitle>
        <DialogContent>
          {reviewDialog.item && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Type:</strong> {Object.keys(reviewDialog.item.target_type)[0]}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Target ID:</strong> {reviewDialog.item.target_id.toString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Reason:</strong> {reviewDialog.item.reason}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Review Notes (optional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any additional notes about this decision..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewDialog}>Cancel</Button>
          <Button
            onClick={confirmReview}
            variant="contained"
            color={reviewDialog.action === 'approve' ? 'success' : 'error'}
            startIcon={reviewDialog.action === 'approve' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            {reviewDialog.action === 'approve' ? 'Approve' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModerationQueue; 