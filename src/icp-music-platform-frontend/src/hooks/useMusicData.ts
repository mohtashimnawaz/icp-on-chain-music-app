import { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';
import type { 
  Track, 
  Artist, 
  Playlist, 
  Notification, 
  CollabRequest, 
  Task, 
  TrackAnalytics, 
  TrackPerformanceMetrics, 
  UserEngagementMetrics, 
  WorkflowStep, 
  Message, 
  Activity,
  TaskStatus,
  WorkflowStatus
} from '../services/musicService';

// Hook for tracks with comprehensive functionality
export const useTracks = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const tracksData = await musicService.listTracks();
      setTracks(tracksData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tracks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const createTrack = async (trackData: {
    title: string;
    description: string;
    contributors: bigint[];
  }) => {
    try {
      const newTrack = await musicService.createTrack(
        trackData.title,
        trackData.description,
        trackData.contributors
      );
      if (newTrack) {
        setTracks(prev => [...prev, newTrack]);
        return newTrack;
      }
      return null;
    } catch (err) {
      console.error('Failed to create track:', err);
      return null;
    }
  };

  const rateTrack = async (trackId: bigint, userId: bigint, rating: number) => {
    try {
      const success = await musicService.rateTrack(trackId, userId, rating);
      if (success) {
        await fetchTracks();
      }
      return success;
    } catch (err) {
      console.error('Failed to rate track:', err);
      return false;
    }
  };

  const commentOnTrack = async (trackId: bigint, userId: bigint, text: string) => {
    try {
      const success = await musicService.commentOnTrack(trackId, userId, text);
      if (success) {
        await fetchTracks();
      }
      return success;
    } catch (err) {
      console.error('Failed to comment on track:', err);
      return false;
    }
  };

  const playTrack = async (trackId: bigint) => {
    try {
      return await musicService.incrementPlayCount(trackId);
    } catch (err) {
      console.error('Failed to play track:', err);
      return false;
    }
  };

  const searchTracks = async (query: string, type: 'title' | 'tag' | 'genre' = 'title') => {
    try {
      let results: Track[] = [];
      switch (type) {
        case 'title':
          results = await musicService.searchTracksByTitle(query);
          break;
        case 'tag':
          results = await musicService.searchTracksByTag(query);
          break;
        case 'genre':
          results = await musicService.searchTracksByGenre(query);
          break;
      }
      return results;
    } catch (err) {
      console.error('Failed to search tracks:', err);
      return [];
    }
  };

  return {
    tracks,
    loading,
    error,
    fetchTracks,
    createTrack,
    rateTrack,
    commentOnTrack,
    playTrack,
    searchTracks,
  };
};

// Hook for artists
export const useArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const artistsData = await musicService.listArtists();
      setArtists(artistsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch artists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const registerArtist = async (
    name: string, 
    bio: string, 
    social?: string,
    profileImageUrl?: string,
    links?: string[]
  ) => {
    try {
      const newArtist = await musicService.registerArtist(name, bio, social, profileImageUrl, links);
      if (newArtist) {
        setArtists(prev => [...prev, newArtist]);
        return newArtist;
      }
      return null;
    } catch (err) {
      console.error('Failed to register artist:', err);
      return null;
    }
  };

  const followArtist = async (artistPrincipal: string) => {
    try {
      return await musicService.followArtist(artistPrincipal);
    } catch (err) {
      console.error('Failed to follow artist:', err);
      return false;
    }
  };

  const unfollowArtist = async (artistPrincipal: string) => {
    try {
      return await musicService.unfollowArtist(artistPrincipal);
    } catch (err) {
      console.error('Failed to unfollow artist:', err);
      return false;
    }
  };

  return {
    artists,
    loading,
    error,
    fetchArtists,
    registerArtist,
    followArtist,
    unfollowArtist,
  };
};

// Hook for playlists
export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const playlistsData = await musicService.listPlaylists();
      setPlaylists(playlistsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch playlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async (name: string, description?: string, trackIds: bigint[] = []) => {
    try {
      const newPlaylist = await musicService.createPlaylist(name, description, trackIds);
      if (newPlaylist) {
        setPlaylists(prev => [...prev, newPlaylist]);
        return newPlaylist;
      }
      return null;
    } catch (err) {
      console.error('Failed to create playlist:', err);
      return null;
    }
  };

  return {
    playlists,
    loading,
    error,
    fetchPlaylists,
    createPlaylist,
  };
};

// Hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await musicService.listNotifications();
      setNotifications(notificationsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: bigint) => {
    try {
      const success = await musicService.markNotificationRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
};

// Hook for collaboration requests
export const useCollaboration = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollabRequests = async (userId: bigint) => {
    try {
      setLoading(true);
      const requestsData = await musicService.listCollabRequestsForUser(userId);
      setRequests(requestsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch collaboration requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendCollabRequest = async (fromUserId: bigint, toUserId: bigint, trackId: bigint, message?: string) => {
    try {
      const newRequest = await musicService.sendCollabRequest(fromUserId, toUserId, trackId, message);
      if (newRequest) {
        setRequests(prev => [...prev, newRequest]);
        return newRequest;
      }
      return null;
    } catch (err) {
      console.error('Failed to send collaboration request:', err);
      return null;
    }
  };

  const respondToCollabRequest = async (requestId: bigint, accept: boolean) => {
    try {
      const updatedRequest = await musicService.respondCollabRequest(requestId, accept);
      if (updatedRequest) {
        setRequests(prev => 
          prev.map(req => req.id === requestId ? updatedRequest : req)
        );
        return updatedRequest;
      }
      return null;
    } catch (err) {
      console.error('Failed to respond to collaboration request:', err);
      return null;
    }
  };

  return {
    requests,
    loading,
    error,
    fetchCollabRequests,
    sendCollabRequest,
    respondToCollabRequest,
  };
};

// Hook for task management
export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasksForTrack = async (trackId: bigint) => {
    try {
      setLoading(true);
      const tasksData = await musicService.listTasksForTrack(trackId);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForUser = async (userId: bigint) => {
    try {
      setLoading(true);
      const tasksData = await musicService.listTasksForUser(userId);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (trackId: bigint, assignedTo: bigint, description: string) => {
    try {
      const newTask = await musicService.createTask(trackId, assignedTo, description);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
        return newTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to create task:', err);
      return null;
    }
  };

  const updateTaskStatus = async (taskId: bigint, status: string) => {
    try {
      const updatedTask = await musicService.updateTaskStatus(taskId, status);
      if (updatedTask) {
        setTasks(prev => 
          prev.map(task => task.id === taskId ? updatedTask : task)
        );
        return updatedTask;
      }
      return null;
    } catch (err) {
      console.error('Failed to update task status:', err);
      return null;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasksForTrack,
    fetchTasksForUser,
    createTask,
    updateTaskStatus,
  };
};

// Hook for workflow management
export const useWorkflow = () => {
  const [steps, setSteps] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflowSteps = async (trackId: bigint) => {
    try {
      setLoading(true);
      const stepsData = await musicService.getTrackWorkflowSteps(trackId);
      setSteps(stepsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workflow steps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborationSessions = async (trackId: bigint) => {
    try {
      const sessionsData = await musicService.getTrackCollaborationSessions(trackId);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to fetch collaboration sessions:', err);
    }
  };

  const fetchWorkflowTemplates = async (genre?: string) => {
    try {
      const templatesData = genre 
        ? await musicService.getWorkflowTemplatesByGenre(genre)
        : await musicService.getWorkflowTemplates();
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to fetch workflow templates:', err);
    }
  };

  const createWorkflowStep = async (trackId: bigint, stepName: string, assignedTo: bigint[], dueDate?: bigint, notes?: string) => {
    try {
      const newStep = await musicService.createWorkflowStep(trackId, stepName, assignedTo, dueDate, notes);
      if (newStep) {
        setSteps(prev => [...prev, newStep]);
        return newStep;
      }
      return null;
    } catch (err) {
      console.error('Failed to create workflow step:', err);
      return null;
    }
  };

  const updateWorkflowStepStatus = async (stepId: bigint, status: string, notes?: string) => {
    try {
      const updatedStep = await musicService.updateWorkflowStepStatus(stepId, status, notes);
      if (updatedStep) {
        setSteps(prev => 
          prev.map(step => step.id === stepId ? updatedStep : step)
        );
        return updatedStep;
      }
      return null;
    } catch (err) {
      console.error('Failed to update workflow step status:', err);
      return null;
    }
  };

  const createCollaborationSession = async (trackId: bigint, sessionName: string, participants: bigint[], notes?: string) => {
    try {
      const newSession = await musicService.createCollaborationSession(trackId, sessionName, participants, notes);
      if (newSession) {
        setSessions(prev => [...prev, newSession]);
        return newSession;
      }
      return null;
    } catch (err) {
      console.error('Failed to create collaboration session:', err);
      return null;
    }
  };

  return {
    steps,
    sessions,
    templates,
    loading,
    error,
    fetchWorkflowSteps,
    fetchCollaborationSessions,
    fetchWorkflowTemplates,
    createWorkflowStep,
    updateWorkflowStepStatus,
    createCollaborationSession,
  };
};

// Hook for analytics
export const useAnalytics = () => {
  const [trackMetrics, setTrackMetrics] = useState<any>(null);
  const [userMetrics, setUserMetrics] = useState<any>(null);
  const [revenueInsights, setRevenueInsights] = useState<any>(null);
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackMetrics = async (trackId: bigint) => {
    try {
      setLoading(true);
      const metrics = await musicService.getTrackPerformanceMetrics(trackId);
      setTrackMetrics(metrics);
      setError(null);
    } catch (err) {
      setError('Failed to fetch track metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMetrics = async (userId: bigint) => {
    try {
      const metrics = await musicService.getUserEngagementMetrics(userId);
      setUserMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch user metrics:', err);
    }
  };

  const fetchRevenueInsights = async () => {
    try {
      const insights = await musicService.getRevenueInsights();
      setRevenueInsights(insights);
    } catch (err) {
      console.error('Failed to fetch revenue insights:', err);
    }
  };

  const fetchPlatformAnalytics = async () => {
    try {
      const analytics = await musicService.getPlatformAnalytics();
      setPlatformAnalytics(analytics);
    } catch (err) {
      console.error('Failed to fetch platform analytics:', err);
    }
  };

  return {
    trackMetrics,
    userMetrics,
    revenueInsights,
    platformAnalytics,
    loading,
    error,
    fetchTrackMetrics,
    fetchUserMetrics,
    fetchRevenueInsights,
    fetchPlatformAnalytics,
  };
};

// Hook for messaging
export const useMessaging = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessagesWithUser = async (userPrincipal: string) => {
    try {
      setLoading(true);
      const messagesData = await musicService.listMessagesWith(userPrincipal);
      setMessages(messagesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (toPrincipal: string, content: string) => {
    try {
      const newMessage = await musicService.sendMessage(toPrincipal, content);
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      }
      return null;
    } catch (err) {
      console.error('Failed to send message:', err);
      return null;
    }
  };

  const markMessageAsRead = async (messageId: bigint) => {
    try {
      const success = await musicService.markMessageRead(messageId);
      if (success) {
        setMessages(prev =>
          prev.map(message =>
            message.id === messageId ? { ...message, read: true } : message
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      return false;
    }
  };

  return {
    messages,
    loading,
    error,
    fetchMessagesWithUser,
    sendMessage,
    markMessageAsRead,
  };
};

// Hook for activity feed
export const useActivity = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserActivity = async (userId: bigint) => {
    try {
      setLoading(true);
      const activityData = await musicService.getUserActivity(userId);
      setActivities(activityData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async (limit: number = 20) => {
    try {
      setLoading(true);
      const activityData = await musicService.getRecentActivity(limit);
      setActivities(activityData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recent activity');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    error,
    fetchUserActivity,
    fetchRecentActivity,
  };
};

// Hook for user engagement metrics
export const useUserEngagement = (userId: bigint) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const metricsData = await musicService.getUserEngagementMetrics(userId);
        setMetrics(metricsData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch engagement metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMetrics();
    }
  }, [userId]);

  return {
    metrics,
    loading,
    error,
  };
};

// Hook for royalties management
export const useRoyalties = (artistId: bigint) => {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoyaltyData = async () => {
      try {
        setLoading(true);
        const [balanceData, historyData] = await Promise.all([
          musicService.getRoyaltyBalance(artistId),
          musicService.getPaymentHistory(artistId)
        ]);
        setBalance(balanceData);
        setPaymentHistory(historyData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch royalty data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchRoyaltyData();
    }
  }, [artistId]);

  const withdrawRoyalties = async (artistId: bigint, amount: bigint) => {
    try {
      const success = await musicService.withdrawRoyalties(artistId, amount);
      if (success) {
        // Refresh balance after withdrawal
        const newBalance = await musicService.getRoyaltyBalance(artistId);
        setBalance(newBalance);
      }
      return success;
    } catch (err) {
      console.error('Failed to withdraw royalties:', err);
      return false;
    }
  };

  return {
    balance,
    paymentHistory,
    loading,
    error,
    withdrawRoyalties,
  };
};

// Hook for admin features
export const useAdmin = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsData = await musicService.listReports();
      setReports(reportsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationQueue = async () => {
    try {
      const queueData = await musicService.listModerationQueue();
      setModerationQueue(queueData);
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    }
  };

  const fetchSuspensions = async () => {
    try {
      const suspensionsData = await musicService.listSuspensions();
      setSuspensions(suspensionsData);
    } catch (err) {
      console.error('Failed to fetch suspensions:', err);
    }
  };

  const fetchAppeals = async () => {
    try {
      const appealsData = await musicService.listSuspensionAppeals();
      setAppeals(appealsData);
    } catch (err) {
      console.error('Failed to fetch appeals:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      const logData = await musicService.listAuditLog();
      setAuditLog(logData);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  const reviewReport = async (reportId: bigint, status: string, notes?: string) => {
    try {
      const success = await musicService.reviewReport(reportId, status, notes);
      if (success) {
        await fetchReports(); // Refresh reports
      }
      return success;
    } catch (err) {
      console.error('Failed to review report:', err);
      return false;
    }
  };

  const reviewModerationItem = async (itemId: bigint, status: string, notes?: string) => {
    try {
      const success = await musicService.reviewModerationItem(itemId, status, notes);
      if (success) {
        await fetchModerationQueue(); // Refresh queue
      }
      return success;
    } catch (err) {
      console.error('Failed to review moderation item:', err);
      return false;
    }
  };

  return {
    reports,
    moderationQueue,
    suspensions,
    appeals,
    auditLog,
    loading,
    error,
    fetchReports,
    fetchModerationQueue,
    fetchSuspensions,
    fetchAppeals,
    fetchAuditLog,
    reviewReport,
    reviewModerationItem,
  };
};
