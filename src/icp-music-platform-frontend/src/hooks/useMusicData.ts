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
export const useCollabRequests = (userId?: bigint) => {
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollabRequests = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const requestsData = await musicService.listCollabRequestsForUser(userId);
      setCollabRequests(requestsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch collaboration requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCollabRequests();
    }
  }, [userId]);

  const sendCollabRequest = async (to: bigint, trackId: bigint, message?: string) => {
    if (!userId) return null;
    
    try {
      const newRequest = await musicService.sendCollabRequest(userId, to, trackId, message);
      if (newRequest) {
        setCollabRequests(prev => [...prev, newRequest]);
        return newRequest;
      }
      return null;
    } catch (err) {
      console.error('Failed to send collaboration request:', err);
      return null;
    }
  };

  const respondToRequest = async (requestId: bigint, accept: boolean) => {
    try {
      const updatedRequest = await musicService.respondCollabRequest(requestId, accept);
      if (updatedRequest) {
        setCollabRequests(prev =>
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
    collabRequests,
    loading,
    error,
    fetchCollabRequests,
    sendCollabRequest,
    respondToRequest,
  };
};

// Hook for tasks
export const useTasks = (userId?: bigint) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!userId) return;
    
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

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

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

  const updateTaskStatus = async (taskId: bigint, status: TaskStatus) => {
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
    fetchTasks,
    createTask,
    updateTaskStatus,
  };
};

// Hook for track analytics
export const useTrackAnalytics = (trackId?: bigint) => {
  const [analytics, setAnalytics] = useState<TrackAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<TrackPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!trackId) return;
    
    try {
      setLoading(true);
      const [analyticsData, metricsData] = await Promise.all([
        musicService.getTrackAnalytics(trackId),
        musicService.getTrackPerformanceMetrics(trackId)
      ]);
      setAnalytics(analyticsData);
      setPerformanceMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch track analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackId) {
      fetchAnalytics();
    }
  }, [trackId]);

  return {
    analytics,
    performanceMetrics,
    loading,
    error,
    fetchAnalytics,
  };
};

// Hook for workflow management
export const useWorkflow = (trackId?: bigint) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflowSteps = async () => {
    if (!trackId) return;
    
    try {
      setLoading(true);
      const stepsData = await musicService.getTrackWorkflowSteps(trackId);
      setWorkflowSteps(stepsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workflow steps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackId) {
      fetchWorkflowSteps();
    }
  }, [trackId]);

  const createWorkflowStep = async (
    stepName: string,
    assignedTo: bigint[],
    dueDate?: bigint,
    notes?: string
  ) => {
    if (!trackId) return null;
    
    try {
      const newStep = await musicService.createWorkflowStep(trackId, stepName, assignedTo, dueDate, notes);
      if (newStep) {
        setWorkflowSteps(prev => [...prev, newStep]);
        return newStep;
      }
      return null;
    } catch (err) {
      console.error('Failed to create workflow step:', err);
      return null;
    }
  };

  return {
    workflowSteps,
    loading,
    error,
    fetchWorkflowSteps,
    createWorkflowStep,
  };
};

// Hook for messaging
export const useMessages = (userPrincipal?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!userPrincipal) return;
    
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

  useEffect(() => {
    if (userPrincipal) {
      fetchMessages();
    }
  }, [userPrincipal]);

  const sendMessage = async (to: string, content: string) => {
    try {
      const newMessage = await musicService.sendMessage(to, content);
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

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
  };
};

// Hook for activity feed
export const useActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentActivity = async (limit: number = 20) => {
    try {
      setLoading(true);
      const activitiesData = await musicService.getRecentActivity(limit);
      setActivities(activitiesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recent activity');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  return {
    activities,
    loading,
    error,
    fetchRecentActivity,
  };
};

// Hook for user engagement metrics
export const useUserEngagement = (userId?: bigint) => {
  const [metrics, setMetrics] = useState<UserEngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const metricsData = await musicService.getUserEngagementMetrics(userId);
      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user engagement metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMetrics();
    }
  }, [userId]);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
  };
};

// Hook for royalties
export const useRoyalties = (artistId?: bigint) => {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!artistId) return;
    
    try {
      setLoading(true);
      const balanceData = await musicService.getRoyaltyBalance(artistId);
      setBalance(balanceData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch royalty balance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artistId) {
      fetchBalance();
    }
  }, [artistId]);

  const withdrawRoyalties = async (amount: bigint) => {
    if (!artistId) return false;
    
    try {
      const success = await musicService.withdrawRoyalties(artistId, amount);
      if (success) {
        await fetchBalance();
      }
      return success;
    } catch (err) {
      console.error('Failed to withdraw royalties:', err);
      return false;
    }
  };

  return {
    balance,
    loading,
    error,
    fetchBalance,
    withdrawRoyalties,
  };
};
