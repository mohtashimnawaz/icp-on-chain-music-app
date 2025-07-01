import React, { useState } from 'react';
import './MusicStudio.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  useTracks, 
  useCollabRequests, 
  useTasks, 
  useWorkflow,
  useTrackAnalytics
} from '../hooks/useMusicData';

export const MusicStudio: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tracks, createTrack, loading: tracksLoading } = useTracks();
  const [selectedTrackId, setSelectedTrackId] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'collaboration' | 'tasks' | 'workflow' | 'analytics'>('overview');
  
  // Mock user ID for demo
  const mockUserId = BigInt(1);
  
  const { requests: collabRequests, sendCollabRequest, respondToCollabRequest } = useCollabRequests();
  const { tasks, createTask, updateTaskStatus } = useTasks();
  const { steps, createWorkflowStep } = useWorkflow();
  const { trackMetrics } = useTrackAnalytics();

  const [newTrackForm, setNewTrackForm] = useState({
    title: '',
    description: '',
    contributors: [mockUserId]
  });

  const [newTaskForm, setNewTaskForm] = useState({
    description: '',
    assignedTo: mockUserId
  });

  const [newCollabForm, setNewCollabForm] = useState({
    to: BigInt(2),
    message: ''
  });

  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTrack = await createTrack(newTrackForm);
    if (newTrack) {
      setNewTrackForm({ title: '', description: '', contributors: [mockUserId] });
      setSelectedTrackId(newTrack.id);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId) return;
    
    const newTask = await createTask(selectedTrackId, newTaskForm.assignedTo, newTaskForm.description);
    if (newTask) {
      setNewTaskForm({ description: '', assignedTo: mockUserId });
    }
  };

  const handleSendCollabRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId) return;
    
    const request = await sendCollabRequest(newCollabForm.to, selectedTrackId, newCollabForm.message);
    if (request) {
      setNewCollabForm({ to: BigInt(2), message: '' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="studio-container">
        <div className="auth-required">
          <h2>Music Studio</h2>
          <p>Please connect with Internet Identity to access the studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-container">
      <div className="studio-header">
        <h1>🎵 Music Studio</h1>
        <p>Create, collaborate, and manage your musical projects</p>
      </div>

      <div className="studio-layout">
        {/* Left Sidebar - Track List */}
        <div className="tracks-sidebar">
          <div className="sidebar-header">
            <h2>Your Tracks</h2>
            <button 
              className="btn-primary"
              onClick={() => setActiveTab('overview')}
            >
              + New Track
            </button>
          </div>
          
          {tracksLoading ? (
            <div className="loading">Loading tracks...</div>
          ) : (
            <div className="track-list">
              {tracks.map((track) => (
                <div
                  key={track.id.toString()}
                  className={`track-item ${selectedTrackId === track.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <div className="track-title">{track.title}</div>
                  <div className="track-meta">
                    {track.play_count.toString()} plays • Version {track.version}
                  </div>
                  {track.visibility === 'Private' && (
                    <span className="privacy-badge">Private</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            {['overview', 'collaboration', 'tasks', 'workflow', 'analytics'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="section">
                  <h3>Create New Track</h3>
                  <form onSubmit={handleCreateTrack} className="track-form">
                    <div className="form-group">
                      <label>Track Title</label>
                      <input
                        type="text"
                        value={newTrackForm.title}
                        onChange={(e) => setNewTrackForm({...newTrackForm, title: e.target.value})}
                        placeholder="Enter track title..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={newTrackForm.description}
                        onChange={(e) => setNewTrackForm({...newTrackForm, description: e.target.value})}
                        placeholder="Describe your track..."
                        rows={4}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Create Track
                    </button>
                  </form>
                </div>

                {selectedTrackId && (
                  <div className="section">
                    <h3>Track Details</h3>
                    {tracks.find(t => t.id === selectedTrackId) && (
                      <div className="track-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>Play Count</label>
                            <span>{tracks.find(t => t.id === selectedTrackId)?.play_count.toString()}</span>
                          </div>
                          <div className="detail-item">
                            <label>Comments</label>
                            <span>{tracks.find(t => t.id === selectedTrackId)?.comments.length}</span>
                          </div>
                          <div className="detail-item">
                            <label>Ratings</label>
                            <span>{tracks.find(t => t.id === selectedTrackId)?.ratings.length}</span>
                          </div>
                          <div className="detail-item">
                            <label>Version</label>
                            <span>{tracks.find(t => t.id === selectedTrackId)?.version}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collaboration' && (
              <div className="collaboration-tab">
                <div className="section">
                  <h3>Send Collaboration Request</h3>
                  {selectedTrackId ? (
                    <form onSubmit={handleSendCollabRequest} className="collab-form">
                      <div className="form-group">
                        <label>Collaborator ID</label>
                        <input
                          type="number"
                          value={newCollabForm.to.toString()}
                          onChange={(e) => setNewCollabForm({...newCollabForm, to: BigInt(e.target.value)})}
                          placeholder="Enter user ID..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Message</label>
                        <textarea
                          value={newCollabForm.message}
                          onChange={(e) => setNewCollabForm({...newCollabForm, message: e.target.value})}
                          placeholder="Invitation message..."
                          rows={3}
                        />
                      </div>
                      <button type="submit" className="btn-primary">
                        Send Request
                      </button>
                    </form>
                  ) : (
                    <p className="select-track">Select a track to send collaboration requests.</p>
                  )}
                </div>

                <div className="section">
                  <h3>Collaboration Requests</h3>
                  {collabRequests.length > 0 ? (
                    <div className="requests-list">
                      {collabRequests.map((request) => (
                        <div key={request.id.toString()} className="request-item">
                          <div className="request-info">
                            <div className="request-details">
                              <strong>From User {request.from.toString()}</strong> for Track {request.track_id.toString()}
                            </div>
                            {request.message && (
                              <div className="request-message">"{request.message}"</div>
                            )}
                            <div className="request-status">Status: {request.status}</div>
                          </div>
                          {request.status === 'Pending' && (
                            <div className="request-actions">
                              <button 
                                className="btn-success"
                                onClick={() => respondToCollabRequest(request.id, true)}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn-danger"
                                onClick={() => respondToCollabRequest(request.id, false)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">No collaboration requests</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="tasks-tab">
                <div className="section">
                  <h3>Create New Task</h3>
                  {selectedTrackId ? (
                    <form onSubmit={handleCreateTask} className="task-form">
                      <div className="form-group">
                        <label>Task Description</label>
                        <input
                          type="text"
                          value={newTaskForm.description}
                          onChange={(e) => setNewTaskForm({...newTaskForm, description: e.target.value})}
                          placeholder="What needs to be done?"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Assigned To</label>
                        <input
                          type="number"
                          value={newTaskForm.assignedTo.toString()}
                          onChange={(e) => setNewTaskForm({...newTaskForm, assignedTo: BigInt(e.target.value)})}
                          placeholder="User ID"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary">
                        Create Task
                      </button>
                    </form>
                  ) : (
                    <p className="select-track">Select a track to create tasks.</p>
                  )}
                </div>

                <div className="section">
                  <h3>Your Tasks</h3>
                  {tasks.length > 0 ? (
                    <div className="tasks-list">
                      {tasks.map((task) => (
                        <div key={task.id.toString()} className="task-item">
                          <div className="task-content">
                            <div className="task-description">{task.description}</div>
                            <div className="task-meta">
                              Track {task.track_id.toString()} • Created {new Date(Number(task.created_at) / 1000000).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="task-status">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                              className="status-select"
                            >
                              <option value="Open">Open</option>
                              <option value="InProgress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data">No tasks assigned</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="workflow-tab">
                <div className="section">
                  <h3>Workflow Steps</h3>
                  {selectedTrackId ? (
                    <div className="workflow-content">
                      {workflowSteps.length > 0 ? (
                        <div className="workflow-steps">
                          {workflowSteps.map((step) => (
                            <div key={step.id.toString()} className="workflow-step">
                              <div className="step-header">
                                <h4>{step.step_name}</h4>
                                <span className={`status-badge ${step.status.toLowerCase()}`}>
                                  {step.status}
                                </span>
                              </div>
                              {step.notes && (
                                <div className="step-notes">{step.notes}</div>
                              )}
                              <div className="step-meta">
                                Assigned to: {step.assigned_to.map(id => id.toString()).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-data">No workflow steps defined</div>
                      )}
                    </div>
                  ) : (
                    <p className="select-track">Select a track to view workflow.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-tab">
                <div className="section">
                  <h3>Track Analytics</h3>
                  {selectedTrackId ? (
                    <div className="analytics-content">
                      {analytics && (
                        <div className="analytics-grid">
                          <div className="analytics-card">
                            <h4>Play Count</h4>
                            <div className="metric-value">{analytics.play_count.toString()}</div>
                          </div>
                          <div className="analytics-card">
                            <h4>Revenue</h4>
                            <div className="metric-value">{analytics.revenue.toString()} ICP</div>
                          </div>
                          <div className="analytics-card">
                            <h4>Comments</h4>
                            <div className="metric-value">{analytics.comments_count.toString()}</div>
                          </div>
                          <div className="analytics-card">
                            <h4>Average Rating</h4>
                            <div className="metric-value">{analytics.avg_rating.toFixed(1)} ⭐</div>
                          </div>
                        </div>
                      )}
                      
                      {performanceMetrics && (
                        <div className="performance-section">
                          <h4>Performance Metrics</h4>
                          <div className="metrics-grid">
                            <div className="metric-item">
                              <label>Unique Listeners</label>
                              <span>{performanceMetrics.unique_listeners.toString()}</span>
                            </div>
                            <div className="metric-item">
                              <label>Engagement Rate</label>
                              <span>{(performanceMetrics.engagement_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="metric-item">
                              <label>Growth Rate</label>
                              <span>{(performanceMetrics.growth_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="metric-item">
                              <label>Download Count</label>
                              <span>{performanceMetrics.download_count.toString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="select-track">Select a track to view analytics.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
