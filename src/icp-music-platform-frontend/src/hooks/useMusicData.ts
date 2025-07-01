import { useState, useEffect } from 'react';
import { musicService } from '../services/musicService';
import type { Track, Artist, Playlist, Notification } from '../services/musicService';

// Hook for tracks
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
    visibility: string;
    tags: string[];
    genre?: string;
  }) => {
    try {
      const newTrack = await musicService.createTrack(
        trackData.title,
        trackData.description,
        trackData.contributors,
        trackData.visibility as any,
        trackData.tags,
        trackData.genre
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

  const rateTrack = async (trackId: bigint, rating: number) => {
    try {
      const success = await musicService.rateTrack(trackId, rating);
      if (success) {
        // Refresh tracks to get updated ratings
        await fetchTracks();
      }
      return success;
    } catch (err) {
      console.error('Failed to rate track:', err);
      return false;
    }
  };

  const commentOnTrack = async (trackId: bigint, text: string) => {
    try {
      const success = await musicService.commentOnTrack(trackId, text);
      if (success) {
        // Refresh tracks to get updated comments
        await fetchTracks();
      }
      return success;
    } catch (err) {
      console.error('Failed to comment on track:', err);
      return false;
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

  const registerArtist = async (name: string, bio: string, social?: string) => {
    try {
      const newArtist = await musicService.registerArtist(name, bio, social);
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
