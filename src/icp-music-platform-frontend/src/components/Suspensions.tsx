import React, { useEffect, useState } from 'react';
import { listSuspensions, liftSuspension } from '../services/musicService';
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
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Suspensions: React.FC = () => {
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lifting, setLifting] = useState<bigint | null>(null);
  const [liftDialog, setLiftDialog] = useState<{
    open: boolean;
    suspension: any | null;
  }>({
    open: false,
    suspension: null,
  });

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchSuspensions = async () => {
    const fetchPromise = (async () => {
      setError('');
      try {
        const data = await listSuspensions();
        setSuspensions(data);
      } catch (error) {
        setError('Failed to load suspensions.');
        showMessage('Failed to load suspensions', 'error');
      }
    })();
    
    await withLoading(fetchPromise, 'Loading suspensions...');
  };

  useEffect(() => { 
    fetchSuspensions(); 
  }, [withLoading, showMessage]);

  const handleLift = async (id: bigint) => {
    const liftPromise = (async () => {
      try {
        await liftSuspension(id);
        showMessage('Suspension lifted successfully!', 'success');
        fetchSuspensions();
        setLiftDialog({ open: false, suspension: null });
      } catch (error) {
        showMessage('Failed to lift suspension', 'error');
      }
    })();
    
    await withLoading(liftPromise, 'Lifting suspension...');
  };

  const openLiftDialog = (suspension: any) => {
    setLiftDialog({ open: true, suspension });
  };

  const closeLiftDialog = () => {
    setLiftDialog({ open: false, suspension: null });
  };

  const confirmLift = () => {
    if (!liftDialog.suspension) return;
    handleLift(liftDialog.suspension.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'error';
      case 'Lifted': return 'success';
      case 'Expired': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'User': return <PersonIcon />;
      case 'Track': return <MusicNoteIcon />;
      case 'Artist': return <AdminPanelSettingsIcon />;
      default: return <BlockIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'User': return 'error';
      case 'Track': return 'warning';
      case 'Artist': return 'info';
      default: return 'default';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const activeSuspensions = suspensions.filter(s => Object.keys(s.status)[0] === 'Active');

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
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
              ml: 2
            }}>
              Suspensions
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Manage user and track suspensions in a beautiful, immersive admin panel.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <BlockIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4">{activeSuspensions.length}</Typography>
            <Typography variant="body2">Active Suspensions</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4">{suspensions.length - activeSuspensions.length}</Typography>
            <Typography variant="body2">Lifted/Expired</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4">
              {suspensions.filter(s => Object.keys(s.target_type)[0] === 'User').length}
            </Typography>
            <Typography variant="body2">User Suspensions</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <MusicNoteIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4">
              {suspensions.filter(s => Object.keys(s.target_type)[0] === 'Track').length}
            </Typography>
            <Typography variant="body2">Track Suspensions</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Suspensions Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              All Suspensions ({suspensions.length})
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchSuspensions}
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
          ) : suspensions.length === 0 ? (
            <Alert severity="info">
              No suspensions found. All users and content are currently active.
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
                    <TableCell><strong>Imposed By</strong></TableCell>
                    <TableCell><strong>Imposed At</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Notes</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suspensions.map((suspension) => {
                    const status = Object.keys(suspension.status)[0];
                    const type = Object.keys(suspension.target_type)[0];
                    const isActive = status === 'Active';
                    
                    return (
                      <TableRow 
                        key={suspension.id.toString()}
                        sx={{ 
                          '&:hover': { backgroundColor: 'grey.50' },
                          backgroundColor: isActive ? 'error.light' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {suspension.id.toString()}
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
                            {suspension.target_id.toString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 150 }}>
                            {suspension.reason}
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" fontFamily="monospace">
                              {suspension.imposed_by ? suspension.imposed_by.toString().substring(0, 20) + '...' : 'System'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">
                              {formatTimeAgo(suspension.imposed_at)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(Number(suspension.imposed_at) * 1000).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {suspension.duration_secs && suspension.duration_secs[0] ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="body2">
                                {formatDuration(Number(suspension.duration_secs[0]))}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Permanent
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 120 }}>
                            {suspension.notes && suspension.notes[0] ? suspension.notes[0] : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isActive ? (
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              onClick={() => openLiftDialog(suspension)}
                              disabled={lifting === suspension.id}
                              startIcon={<CheckCircleIcon />}
                            >
                              Lift
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {status}
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

      {/* Lift Suspension Dialog */}
      <Dialog 
        open={liftDialog.open} 
        onClose={closeLiftDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Lift Suspension
        </DialogTitle>
        <DialogContent>
          {liftDialog.suspension && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Type:</strong> {Object.keys(liftDialog.suspension.target_type)[0]}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Target ID:</strong> {liftDialog.suspension.target_id.toString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Reason:</strong> {liftDialog.suspension.reason}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Imposed:</strong> {new Date(Number(liftDialog.suspension.imposed_at) * 1000).toLocaleString()}
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                Are you sure you want to lift this suspension? The user/content will be immediately reactivated.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLiftDialog}>Cancel</Button>
          <Button
            onClick={confirmLift}
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Lift Suspension
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suspensions; 