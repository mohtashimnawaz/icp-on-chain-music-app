import React, { useEffect, useState } from 'react';
import {
  sendCollabRequest,
  respondCollabRequest,
  listCollabRequestsForUser,
  createTask,
  updateTaskStatus,
  listTasksForTrack,
  listTasksForUser,
  createCollaborationSession,
  endCollaborationSession,
  getTrackCollaborationSessions,
} from '../services/musicService';
import type { CollabRequest, Task, TaskStatus, CollaborationSession } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Mock user/artist context (replace with real context in production)
const MOCK_USER_ID = BigInt(1);
const MOCK_ARTIST_ID = BigInt(1);
const MOCK_TRACK_ID = BigInt(1); // For demo, use a fixed track

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collab-tabpanel-${index}`}
      aria-labelledby={`collab-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Collaboration: React.FC = () => {
  // Tabs: 'requests', 'tasks', 'sessions'
  const [tab, setTab] = useState(0);

  // Collaboration Requests
  const [requests, setRequests] = useState<CollabRequest[]>([]);
  const [inviteTo, setInviteTo] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [responding, setResponding] = useState<bigint | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Sessions
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [endingSession, setEndingSession] = useState<bigint | null>(null);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      const loadPromise = (async () => {
        try {
          if (tab === 0) {
            const data = await listCollabRequestsForUser(MOCK_USER_ID);
            setRequests(data);
          } else if (tab === 1) {
            const data = await listTasksForUser(MOCK_USER_ID);
            setTasks(data);
          } else if (tab === 2) {
            const data = await getTrackCollaborationSessions(MOCK_TRACK_ID);
            setSessions(data);
          }
        } catch (error) {
          showMessage('Failed to load data', 'error');
        }
      })();
      
      await withLoading(loadPromise, 'Loading data...');
    };
    
    loadData();
  }, [tab, withLoading, showMessage]);

  // Send collab request
  const handleInvite = async () => {
    if (!inviteTo.trim()) {
      showMessage('Please enter a recipient ID', 'error');
      return;
    }

    const invitePromise = (async () => {
      setInviteError('');
      try {
        const toId = BigInt(inviteTo);
        const result = await sendCollabRequest(MOCK_ARTIST_ID, toId, MOCK_TRACK_ID, inviteMsg);
        if (result) {
          setRequests((prev) => [...prev, result]);
          setInviteTo('');
          setInviteMsg('');
          showMessage('Collaboration request sent successfully!', 'success');
        } else {
          setInviteError('Request failed or duplicate.');
          showMessage('Request failed or duplicate', 'error');
        }
      } catch (e) {
        setInviteError('Error sending request.');
        showMessage('Error sending request', 'error');
      }
    })();
    
    await withLoading(invitePromise, 'Sending request...');
  };

  // Respond to collab request
  const handleRespond = async (id: bigint, accept: boolean) => {
    const respondPromise = (async () => {
      try {
        const result = await respondCollabRequest(id, accept);
        if (result) {
          setRequests((prev) => prev.map(r => r.id === id ? result : r));
          showMessage(`Request ${accept ? 'accepted' : 'declined'} successfully!`, 'success');
        }
      } catch (error) {
        showMessage('Failed to respond to request', 'error');
      }
    })();
    
    await withLoading(respondPromise, `${accept ? 'Accepting' : 'Declining'} request...`);
  };

  // Create task
  const handleCreateTask = async () => {
    if (!taskDesc.trim()) {
      showMessage('Please enter a task description', 'error');
      return;
    }

    const createTaskPromise = (async () => {
      setTaskError('');
      try {
        const result = await createTask(MOCK_TRACK_ID, MOCK_USER_ID, taskDesc);
        if (result) {
          setTasks((prev) => [...prev, result]);
          setTaskDesc('');
          showMessage('Task created successfully!', 'success');
        } else {
          setTaskError('Task creation failed.');
          showMessage('Task creation failed', 'error');
        }
      } catch (e) {
        setTaskError('Error creating task.');
        showMessage('Error creating task', 'error');
      }
    })();
    
    await withLoading(createTaskPromise, 'Creating task...');
  };

  // Update task status
  const handleUpdateTask = async (id: bigint, status: TaskStatus) => {
    const updateTaskPromise = (async () => {
      try {
        const result = await updateTaskStatus(id, status);
        if (result) {
          setTasks((prev) => prev.map(t => t.id === id ? result : t));
          showMessage('Task status updated successfully!', 'success');
        }
      } catch (error) {
        showMessage('Failed to update task status', 'error');
      }
    })();
    
    await withLoading(updateTaskPromise, 'Updating task...');
  };

  // Create session
  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      showMessage('Please enter a session name', 'error');
      return;
    }

    const createSessionPromise = (async () => {
      setSessionError('');
      try {
        const result = await createCollaborationSession(MOCK_TRACK_ID, sessionName, [MOCK_USER_ID], sessionNotes);
        if (result) {
          setSessions((prev) => [...prev, result]);
          setSessionName('');
          setSessionNotes('');
          showMessage('Collaboration session created successfully!', 'success');
        } else {
          setSessionError('Session creation failed.');
          showMessage('Session creation failed', 'error');
        }
      } catch (e) {
        setSessionError('Error creating session.');
        showMessage('Error creating session', 'error');
      }
    })();
    
    await withLoading(createSessionPromise, 'Creating session...');
  };

  // End session
  const handleEndSession = async (id: bigint) => {
    const endSessionPromise = (async () => {
      try {
        const result = await endCollaborationSession(id);
        if (result) {
          setSessions((prev) => prev.map(s => s.id === id ? result : s));
          showMessage('Session ended successfully!', 'success');
        }
      } catch (error) {
        showMessage('Failed to end session', 'error');
      }
    })();
    
    await withLoading(endSessionPromise, 'Ending session...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Accepted': return 'success';
      case 'Declined': return 'error';
      case 'Completed': return 'success';
      case 'InProgress': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'InProgress': return <PlayArrowIcon />;
      default: return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <GroupIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4">
          Collaboration Hub
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<GroupIcon />} 
            label="Requests" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="Tasks" 
            iconPosition="start"
          />
          <Tab 
            icon={<VideoCallIcon />} 
            label="Sessions" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Requests Tab */}
      <TabPanel value={tab} index={0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Send Collaboration Request
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Recipient Artist ID"
                value={inviteTo}
                onChange={(e) => setInviteTo(e.target.value)}
                placeholder="Enter artist ID"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Message (optional)"
                value={inviteMsg}
                onChange={(e) => setInviteMsg(e.target.value)}
                placeholder="Add a message"
                sx={{ flex: 1 }}
              />
            </Box>
            <Button 
              variant="contained" 
              onClick={handleInvite} 
              disabled={!inviteTo.trim()}
              startIcon={<GroupIcon />}
            >
              Send Request
            </Button>
            {inviteError && (
              <Alert severity="error" sx={{ mt: 2 }}>{inviteError}</Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Collaboration Requests
            </Typography>
            {requests.length === 0 ? (
              <Alert severity="info">No collaboration requests found.</Alert>
            ) : (
              <List>
                {requests.map((request, index) => {
                  const status = Object.keys(request.status)[0];
                  const isPending = status === 'Pending';
                  const canRespond = isPending && request.to === MOCK_USER_ID;
                  
                  return (
                    <React.Fragment key={request.id.toString()}>
                      <ListItem>
                        <ListItemText
                          primary={`Track ${request.track_id.toString()}`}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                From: {request.from.toString()} | To: {request.to.toString()}
                              </Typography>
                              <Chip 
                                label={status} 
                                color={getStatusColor(status) as any}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {canRespond && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                color="success" 
                                onClick={() => handleRespond(request.id, true)}
                                disabled={responding === request.id}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleRespond(request.id, false)}
                                disabled={responding === request.id}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Box>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < requests.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tasks Tab */}
      <TabPanel value={tab} index={1}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create New Task
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Task Description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Enter task description"
                multiline
                rows={2}
              />
            </Box>
            <Button 
              variant="contained" 
              onClick={handleCreateTask} 
              disabled={!taskDesc.trim()}
              startIcon={<AssignmentIcon />}
            >
              Create Task
            </Button>
            {taskError && (
              <Alert severity="error" sx={{ mt: 2 }}>{taskError}</Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Tasks
            </Typography>
            {tasks.length === 0 ? (
              <Alert severity="info">No tasks found.</Alert>
            ) : (
              <List>
                {tasks.map((task, index) => {
                  const status = Object.keys(task.status)[0];
                  const isCompleted = status === 'Completed';
                  
                  return (
                    <React.Fragment key={task.id.toString()}>
                      <ListItem>
                        <ListItemText
                          primary={task.description}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              {getStatusIcon(status)}
                              <Chip 
                                label={status} 
                                color={getStatusColor(status) as any}
                                size="small"
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {!isCompleted && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleUpdateTask(task.id, { Completed: null })}
                              startIcon={<CheckCircleIcon />}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < tasks.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Sessions Tab */}
      <TabPanel value={tab} index={2}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create Collaboration Session
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <TextField
                label="Session Name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
              />
              <TextField
                label="Notes (optional)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add session notes"
                multiline
                rows={3}
              />
            </Box>
            <Button 
              variant="contained" 
              onClick={handleCreateSession} 
              disabled={!sessionName.trim()}
              startIcon={<VideoCallIcon />}
            >
              Create Session
            </Button>
            {sessionError && (
              <Alert severity="error" sx={{ mt: 2 }}>{sessionError}</Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sessions for Track {MOCK_TRACK_ID.toString()}
            </Typography>
            {sessions.length === 0 ? (
              <Alert severity="info">No collaboration sessions found.</Alert>
            ) : (
              <List>
                {sessions.map((session, index) => {
                  const isActive = !session.end_time;
                  
                  return (
                    <React.Fragment key={session.id.toString()}>
                      <ListItem>
                        <ListItemText
                          primary={session.session_name}
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                Started: {new Date(Number(session.start_time) * 1000).toLocaleString()}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                                Participants: {Array.from(session.participants as bigint[]).map(p => p.toString()).join(', ')}
                              </Typography>
                              {session.end_time && (
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <StopIcon sx={{ fontSize: 16 }} />
                                  Ended: {new Date(Number(session.end_time[0]) * 1000).toLocaleString()}
                                </Typography>
                              )}
                              <Chip 
                                label={isActive ? 'Active' : 'Ended'} 
                                color={isActive ? 'success' : 'default'}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {isActive && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleEndSession(session.id)}
                              disabled={endingSession === session.id}
                              startIcon={<StopIcon />}
                            >
                              End Session
                            </Button>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < sessions.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Collaboration; 