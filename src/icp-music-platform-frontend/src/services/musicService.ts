import { icpService } from './icp';

// Define types based on your backend structs
export interface Artist {
  id: bigint;
  name: string;
  bio: string;
  social?: string;
  royalty_balance: bigint;
  profile_image_url?: string;
  links?: string[];
  user_principal: string;
}

export interface Track {
  id: bigint;
  title: string;
  description: string;
  contributors: bigint[];
  version: number;
  splits?: Split[];
  comments: Comment[];
  payments: Payment[];
  visibility: TrackVisibility;
  invited: bigint[];
  roles: [bigint, TrackRole][];
  ratings: [bigint, number][];
  tags: string[];
  genre?: string;
  play_count: bigint;
  downloadable: boolean;
}

export interface Split {
  id: bigint;
  pct: number;
}

export interface Comment {
  commenter: bigint;
  text: string;
}

export interface Payment {
  payer: bigint;
  amount: bigint;
  timestamp: bigint;
}

export interface Playlist {
  id: bigint;
  owner: string;
  name: string;
  description?: string;
  track_ids: bigint[];
  created_at: bigint;
  updated_at: bigint;
}

export interface Notification {
  id: bigint;
  user_principal: string;
  message: string;
  timestamp: bigint;
  read: boolean;
}

export const TrackVisibility = {
  Public: 'Public',
  Private: 'Private',
  InviteOnly: 'InviteOnly',
} as const;

export type TrackVisibility = typeof TrackVisibility[keyof typeof TrackVisibility];

export const TrackRole = {
  Owner: 'Owner',
  Collaborator: 'Collaborator',
  Viewer: 'Viewer',
} as const;

export type TrackRole = typeof TrackRole[keyof typeof TrackRole];

export const UserRole = {
  User: 'User',
  Admin: 'Admin',
  Moderator: 'Moderator',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

class MusicService {
  // Artist operations
  async registerArtist(name: string, bio: string, social?: string): Promise<Artist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.register_artist(name, bio, social ? [social] : []);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error registering artist:', error);
      return null;
    }
  }

  async updateArtist(name: string, bio: string, social?: string): Promise<Artist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.update_artist(name, bio, social ? [social] : []);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating artist:', error);
      return null;
    }
  }

  async getArtist(artistId: bigint): Promise<Artist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.get_artist(artistId);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting artist:', error);
      return null;
    }
  }

  async listArtists(): Promise<Artist[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_artists();
    } catch (error) {
      console.error('Error listing artists:', error);
      return [];
    }
  }

  // Track operations
  async createTrack(
    title: string,
    description: string,
    contributors: bigint[],
    visibility: TrackVisibility,
    tags: string[],
    genre?: string
  ): Promise<Track | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_track(
        title,
        description,
        contributors,
        { [visibility]: null },
        tags,
        genre ? [genre] : []
      );
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating track:', error);
      return null;
    }
  }

  async updateTrack(
    trackId: bigint,
    title: string,
    description: string,
    tags: string[],
    genre?: string
  ): Promise<Track | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.update_track(
        trackId,
        title,
        description,
        tags,
        genre ? [genre] : []
      );
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating track:', error);
      return null;
    }
  }

  async getTrack(trackId: bigint): Promise<Track | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.get_track(trackId);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting track:', error);
      return null;
    }
  }

  async listTracks(): Promise<Track[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_tracks();
    } catch (error) {
      console.error('Error listing tracks:', error);
      return [];
    }
  }

  async rateTrack(trackId: bigint, rating: number): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.rate_track(trackId, rating);
    } catch (error) {
      console.error('Error rating track:', error);
      return false;
    }
  }

  async commentOnTrack(trackId: bigint, text: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.comment_on_track(trackId, text);
    } catch (error) {
      console.error('Error commenting on track:', error);
      return false;
    }
  }

  // Playlist operations
  async createPlaylist(name: string, description?: string, trackIds: bigint[] = []): Promise<Playlist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_playlist(name, description ? [description] : [], trackIds);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  }

  async listPlaylists(): Promise<Playlist[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_playlists();
    } catch (error) {
      console.error('Error listing playlists:', error);
      return [];
    }
  }

  async getPlaylist(playlistId: bigint): Promise<Playlist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.get_playlist(playlistId);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting playlist:', error);
      return null;
    }
  }

  // Social features
  async followArtist(artistPrincipal: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.follow_artist(artistPrincipal);
    } catch (error) {
      console.error('Error following artist:', error);
      return false;
    }
  }

  async unfollowArtist(artistPrincipal: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.unfollow_artist(artistPrincipal);
    } catch (error) {
      console.error('Error unfollowing artist:', error);
      return false;
    }
  }

  async listFollowedArtists(): Promise<string[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_followed_artists();
    } catch (error) {
      console.error('Error listing followed artists:', error);
      return [];
    }
  }

  // Notifications
  async listNotifications(): Promise<Notification[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_notifications();
    } catch (error) {
      console.error('Error listing notifications:', error);
      return [];
    }
  }

  async markNotificationRead(notificationId: bigint): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.mark_notification_read(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

export const musicService = new MusicService();
