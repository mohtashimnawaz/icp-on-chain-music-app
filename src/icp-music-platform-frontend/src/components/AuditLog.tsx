import React, { useEffect, useState } from 'react';
import { listAuditLog } from '../services/musicService';
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
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchLogs = async () => {
    const fetchPromise = (async () => {
      setError('');
      try {
        const data = await listAuditLog();
        setLogs(data);
        setFilteredLogs(data);
      } catch (error) {
        setError('Failed to load audit log.');
        showMessage('Failed to load audit log', 'error');
      }
    })();
    
    await withLoading(fetchPromise, 'Loading audit log...');
  };

  useEffect(() => { 
    fetchLogs(); 
  }, [withLoading, showMessage]);

  // Filter logs based on search term and filters
  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details[0] && log.details[0].toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.admin && log.admin.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filter by target type
    if (targetTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.target_type === targetTypeFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, targetTypeFilter]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return <EditIcon />;
      case 'delete':
      case 'remove':
        return <DeleteIcon />;
      case 'view':
      case 'read':
        return <VisibilityIcon />;
      case 'moderate':
      case 'approve':
      case 'reject':
        return <SecurityIcon />;
      default:
        return <AdminPanelSettingsIcon />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
        return 'success';
      case 'delete':
      case 'remove':
        return 'error';
      case 'view':
      case 'read':
        return 'info';
      case 'moderate':
      case 'approve':
      case 'reject':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTargetTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'track':
        return 'primary';
      case 'artist':
        return 'secondary';
      case 'user':
        return 'info';
      case 'comment':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
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

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  };

  const getUniqueTargetTypes = () => {
    const types = [...new Set(logs.map(log => log.target_type))];
    return types.sort();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setTargetTypeFilter('all');
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
            <HistoryIcon sx={{ fontSize: 40, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              color: '#fff',
              fontWeight: 900,
              letterSpacing: 1,
              ml: 2
            }}>
              Audit Log
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            View all platform actions and changes in a beautiful, immersive admin panel.
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
            <Box sx={{ flex: { xs: 1, md: 4 } }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actions, types, or details..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: 1, md: 3 } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  {getUniqueActions().map(action => (
                    <MenuItem key={action} value={action}>{action}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: 1, md: 3 } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Type</InputLabel>
                <Select
                  value={targetTypeFilter}
                  label="Target Type"
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {getUniqueTargetTypes().map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  size="small"
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  onClick={fetchLogs}
                  disabled={loading}
                  startIcon={<RefreshIcon />}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredLogs.length} of {logs.length} entries
        </Typography>
        {(searchTerm || actionFilter !== 'all' || targetTypeFilter !== 'all') && (
          <Chip 
            label="Filters Active" 
            color="primary" 
            size="small" 
            variant="outlined"
          />
        )}
      </Box>

      {/* Audit Log Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Alert severity="info">
              No audit log entries found.
            </Alert>
          ) : filteredLogs.length === 0 ? (
            <Alert severity="warning">
              No entries match the current filters.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Admin</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                    <TableCell><strong>Target Type</strong></TableCell>
                    <TableCell><strong>Target ID</strong></TableCell>
                    <TableCell><strong>Timestamp</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id.toString()}
                      sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.id.toString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" fontFamily="monospace">
                            {log.admin ? log.admin.toString().substring(0, 20) + '...' : 'System'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getActionIcon(log.action)}
                          label={log.action}
                          color={getActionColor(log.action) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.target_type}
                          color={getTargetTypeColor(log.target_type) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.target_id.toString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">
                            {formatTimestamp(log.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(Number(log.timestamp) * 1000).toLocaleString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {log.details && log.details[0] ? log.details[0] : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLog; 