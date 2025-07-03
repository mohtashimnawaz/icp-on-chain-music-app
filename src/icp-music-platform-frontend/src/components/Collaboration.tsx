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

// Mock user/artist context (replace with real context in production)
const MOCK_USER_ID = BigInt(1);
const MOCK_ARTIST_ID = BigInt(1);
const MOCK_TRACK_ID = BigInt(1); // For demo, use a fixed track

const Collaboration: React.FC = () => {
  // Tabs: 'requests', 'tasks', 'sessions'
  const [tab, setTab] = useState<'requests' | 'tasks' | 'sessions'>('requests');

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

  // Load data
  useEffect(() => {
    if (tab === 'requests') {
      listCollabRequestsForUser(MOCK_USER_ID).then(setRequests);
    } else if (tab === 'tasks') {
      listTasksForUser(MOCK_USER_ID).then(setTasks);
    } else if (tab === 'sessions') {
      getTrackCollaborationSessions(MOCK_TRACK_ID).then(setSessions);
    }
  }, [tab]);

  // Send collab request
  const handleInvite = async () => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const toId = BigInt(inviteTo);
      const result = await sendCollabRequest(MOCK_ARTIST_ID, toId, MOCK_TRACK_ID, inviteMsg);
      if (result) {
        setRequests((prev) => [...prev, result]);
        setInviteTo('');
        setInviteMsg('');
      } else {
        setInviteError('Request failed or duplicate.');
      }
    } catch (e) {
      setInviteError('Error sending request.');
    }
    setInviteLoading(false);
  };

  // Respond to collab request
  const handleRespond = async (id: bigint, accept: boolean) => {
    setResponding(id);
    try {
      const result = await respondCollabRequest(id, accept);
      if (result) {
        setRequests((prev) => prev.map(r => r.id === id ? result : r));
      }
    } catch {}
    setResponding(null);
  };

  // Create task
  const handleCreateTask = async () => {
    setTaskLoading(true);
    setTaskError('');
    try {
      const result = await createTask(MOCK_TRACK_ID, MOCK_USER_ID, taskDesc);
      if (result) {
        setTasks((prev) => [...prev, result]);
        setTaskDesc('');
      } else {
        setTaskError('Task creation failed.');
      }
    } catch (e) {
      setTaskError('Error creating task.');
    }
    setTaskLoading(false);
  };

  // Update task status
  const handleUpdateTask = async (id: bigint, status: TaskStatus) => {
    setTaskLoading(true);
    try {
      const result = await updateTaskStatus(id, status);
      if (result) {
        setTasks((prev) => prev.map(t => t.id === id ? result : t));
      }
    } catch {}
    setTaskLoading(false);
  };

  // Create session
  const handleCreateSession = async () => {
    setSessionLoading(true);
    setSessionError('');
    try {
      const result = await createCollaborationSession(MOCK_TRACK_ID, sessionName, [MOCK_USER_ID], sessionNotes);
      if (result) {
        setSessions((prev) => [...prev, result]);
        setSessionName('');
        setSessionNotes('');
      } else {
        setSessionError('Session creation failed.');
      }
    } catch (e) {
      setSessionError('Error creating session.');
    }
    setSessionLoading(false);
  };

  // End session
  const handleEndSession = async (id: bigint) => {
    setEndingSession(id);
    try {
      const result = await endCollaborationSession(id);
      if (result) {
        setSessions((prev) => prev.map(s => s.id === id ? result : s));
      }
    } catch {}
    setEndingSession(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Collaboration</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setTab('requests')} disabled={tab === 'requests'}>Requests</button>
        <button onClick={() => setTab('tasks')} disabled={tab === 'tasks'} style={{ marginLeft: 8 }}>Tasks</button>
        <button onClick={() => setTab('sessions')} disabled={tab === 'sessions'} style={{ marginLeft: 8 }}>Sessions</button>
      </div>
      {tab === 'requests' && (
        <div>
          <h3>Send Collaboration Request</h3>
          <input
            type="text"
            placeholder="Recipient Artist ID (number)"
            value={inviteTo}
            onChange={e => setInviteTo(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Message (optional)"
            value={inviteMsg}
            onChange={e => setInviteMsg(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleInvite} disabled={inviteLoading || !inviteTo}>
            {inviteLoading ? 'Sending...' : 'Send Request'}
          </button>
          {inviteError && <div style={{ color: 'red' }}>{inviteError}</div>}
          <h3 style={{ marginTop: '2rem' }}>Collaboration Requests</h3>
          <ul>
            {requests.map(r => (
              <li key={r.id.toString()}>
                <b>Track:</b> {r.track_id.toString()} | <b>From:</b> {r.from.toString()} | <b>To:</b> {r.to.toString()} | <b>Status:</b> {Object.keys(r.status)[0]}
                {Object.keys(r.status)[0] === 'Pending' && r.to === MOCK_USER_ID && (
                  <>
                    <button onClick={() => handleRespond(r.id, true)} disabled={responding === r.id} style={{ marginLeft: 8 }}>Accept</button>
                    <button onClick={() => handleRespond(r.id, false)} disabled={responding === r.id} style={{ marginLeft: 8 }}>Decline</button>
                  </>
                )}
                {responding === r.id && <span style={{ marginLeft: 8 }}>Processing...</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === 'tasks' && (
        <div>
          <h3>Create Task</h3>
          <input
            type="text"
            placeholder="Task description"
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleCreateTask} disabled={taskLoading || !taskDesc}>
            {taskLoading ? 'Creating...' : 'Create Task'}
          </button>
          {taskError && <div style={{ color: 'red' }}>{taskError}</div>}
          <h3 style={{ marginTop: '2rem' }}>Your Tasks</h3>
          <ul>
            {tasks.map(t => (
              <li key={t.id.toString()}>
                <b>{t.description}</b> | <b>Status:</b> {Object.keys(t.status)[0]}
                {Object.keys(t.status)[0] !== 'Completed' && (
                  <button onClick={() => handleUpdateTask(t.id, { Completed: null })} disabled={taskLoading} style={{ marginLeft: 8 }}>Mark Completed</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === 'sessions' && (
        <div>
          <h3>Create Collaboration Session</h3>
          <input
            type="text"
            placeholder="Session name"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <button onClick={handleCreateSession} disabled={sessionLoading || !sessionName}>
            {sessionLoading ? 'Creating...' : 'Create Session'}
          </button>
          {sessionError && <div style={{ color: 'red' }}>{sessionError}</div>}
          <h3 style={{ marginTop: '2rem' }}>Sessions for Track {MOCK_TRACK_ID.toString()}</h3>
          <ul>
            {sessions.map(s => (
              <li key={s.id.toString()}>
                <b>{s.session_name}</b> | <b>Started:</b> {new Date(Number(s.start_time) * 1000).toLocaleString()} | <b>Participants:</b> {Array.from(s.participants as bigint[]).map(p => p.toString()).join(', ')}
                {s.end_time && <span> | <b>Ended:</b> {new Date(Number(s.end_time[0]) * 1000).toLocaleString()}</span>}
                {!s.end_time && (
                  <button onClick={() => handleEndSession(s.id)} disabled={endingSession === s.id} style={{ marginLeft: 8 }}>End Session</button>
                )}
                {endingSession === s.id && <span style={{ marginLeft: 8 }}>Ending...</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Collaboration; 