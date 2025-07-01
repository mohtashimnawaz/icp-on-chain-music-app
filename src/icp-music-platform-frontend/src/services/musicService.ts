import { icpService } from './icp';

// Define comprehensive types based on backend interface
export type TrackVisibility = 'Public' | 'Private' | 'InviteOnly';
export type TrackRole = 'Owner' | 'Collaborator' | 'Viewer';
export type CollabRequestStatus = 'Pending' | 'Accepted' | 'Declined';
export type TaskStatus = 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
export type ReportTargetType = 'User' | 'Artist' | 'Track' | 'Comment';
export type ReportStatus = 'Pending' | 'Reviewed' | 'Dismissed' | 'Resolved';
export type LicenseType = 'AllRightsReserved' | 'CreativeCommons' | 'Custom';
export type ModerationTargetType = 'Track' | 'Comment';
export type ModerationStatus = 'Pending' | 'Approved' | 'Removed';
export type WorkflowStatus = 'Planning' | 'Recording' | 'Mixing' | 'Mastering' | 'Review' | 'Published' | 'Archived';
export type AppealStatus = 'Pending' | 'Approved' | 'Denied';

export interface Artist {
  id: bigint;
  name: string;
  bio: string;
  social?: string;
  royalty_balance: bigint;
  profile_image_url?: string;
  links?: string[];
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

export interface CollabRequest {
  id: bigint;
  from: bigint;
  to: bigint;
  track_id: bigint;
  message?: string;
  status: CollabRequestStatus;
  timestamp: bigint;
}

export interface Task {
  id: bigint;
  track_id: bigint;
  assigned_to: bigint;
  description: string;
  status: TaskStatus;
  created_at: bigint;
  updated_at: bigint;
}

export interface TrackAnalytics {
  play_count: bigint;
  revenue: bigint;
  comments_count: bigint;
  ratings_count: bigint;
  avg_rating: number;
}

export interface TrackVersion {
  version: number;
  title: string;
  description: string;
  contributors: bigint[];
  changed_by: string;
  changed_at: bigint;
  change_description?: string;
}

export interface TrackPerformanceMetrics {
  track_id: bigint;
  total_plays: bigint;
  unique_listeners: bigint;
  avg_rating: number;
  total_revenue: bigint;
  comments_count: bigint;
  shares_count: bigint;
  download_count: bigint;
  engagement_rate: number;
  growth_rate: number;
}

export interface UserEngagementMetrics {
  user_id: bigint;
  total_tracks_created: bigint;
  total_plays_received: bigint;
  total_revenue_earned: bigint;
  avg_track_rating: number;
  active_days: bigint;
  followers_count: bigint;
  following_count: bigint;
  engagement_score: number;
}

export interface WorkflowStep {
  id: bigint;
  track_id: bigint;
  step_name: string;
  status: WorkflowStatus;
  assigned_to: bigint[];
  due_date?: bigint;
  completed_at?: bigint;
  notes?: string;
  dependencies: bigint[];
}

export interface CollaborationSession {
  id: bigint;
  track_id: bigint;
  session_name: string;
  participants: bigint[];
  start_time: bigint;
  end_time?: bigint;
  notes?: string;
  recording_url?: string;
}

export interface WorkflowTemplate {
  id: bigint;
  name: string;
  description: string;
  steps: string[];
  estimated_duration_days: number;
  genre_specific: boolean;
  target_genre?: string;
}

export interface RevenueInsights {
  total_platform_revenue: bigint;
  top_earning_tracks: [bigint, bigint][];
  top_earning_artists: [bigint, bigint][];
  revenue_by_genre: [string, bigint][];
  monthly_revenue_trend: [bigint, bigint][];
}

export interface PlatformAnalytics {
  total_tracks: bigint;
  total_users: bigint;
  total_artists: bigint;
  total_plays: bigint;
  total_revenue: bigint;
  avg_track_rating: number;
  most_popular_genres: [string, bigint][];
  most_active_users: [bigint, bigint][];
}

export interface Report {
  id: bigint;
  reporter: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  created_at: bigint;
  reviewed_by?: string;
  reviewed_at?: bigint;
  resolution_notes?: string;
}

export interface ModerationQueueItem {
  id: bigint;
  target_type: ModerationTargetType;
  target_id: string;
  flagged_by?: string;
  reason: string;
  status: ModerationStatus;
  created_at: bigint;
  reviewed_by?: string;
  reviewed_at?: bigint;
  notes?: string;
}

export interface Suspension {
  id: bigint;
  target_type: string;
  target_id: string;
  reason: string;
  imposed_by: string;
  imposed_at: bigint;
  duration_secs?: bigint;
  status: string;
  lifted_by?: string;
  lifted_at?: bigint;
  notes?: string;
}

export interface SuspensionAppeal {
  id: bigint;
  suspension_id: bigint;
  submitted_by: string;
  submitted_at: bigint;
  content: string;
  status: AppealStatus;
  reviewed_by?: string;
  reviewed_at?: bigint;
  notes?: string;
}

export interface AuditLogEntry {
  id: bigint;
  admin: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: bigint;
  details?: string;
}

class MusicService {
  // Artist operations
  async registerArtist(
    name: string,
    bio: string,
    social?: string,
    profileImageUrl?: string,
    links?: string[]
  ): Promise<Artist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.register_artist(
        name,
        bio,
        social ? [social] : [],
        profileImageUrl ? [profileImageUrl] : [],
        links ? [links] : []
      );
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error registering artist:', error);
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

  // Track operations
  async createTrack(
    title: string,
    description: string,
    contributors: bigint[]
  ): Promise<Track | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_track(title, description, contributors);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating track:', error);
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

  async rateTrack(trackId: bigint, userId: bigint, rating: number): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.rate_track(trackId, userId, rating);
    } catch (error) {
      console.error('Error rating track:', error);
      return false;
    }
  }

  async commentOnTrack(trackId: bigint, userId: bigint, text: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      const result = await actor.add_comment(trackId, userId, text);
      return !!result;
    } catch (error) {
      console.error('Error commenting on track:', error);
      return false;
    }
  }

  async searchTracksByTitle(title: string): Promise<Track[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.search_tracks_by_title(title);
    } catch (error) {
      console.error('Error searching tracks by title:', error);
      return [];
    }
  }

  async searchTracksByTag(tag: string): Promise<Track[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.search_tracks_by_tag(tag);
    } catch (error) {
      console.error('Error searching tracks by tag:', error);
      return [];
    }
  }

  async searchTracksByGenre(genre: string): Promise<Track[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.search_tracks_by_genre(genre);
    } catch (error) {
      console.error('Error searching tracks by genre:', error);
      return [];
    }
  }

  async incrementPlayCount(trackId: bigint): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.increment_play_count(trackId);
    } catch (error) {
      console.error('Error incrementing play count:', error);
      return false;
    }
  }

  async getTrackAnalytics(trackId: bigint): Promise<TrackAnalytics | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.get_track_analytics(trackId);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting track analytics:', error);
      return null;
    }
  }

  // Playlist operations
  async createPlaylist(name: string, description?: string, trackIds: bigint[] = []): Promise<Playlist | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_playlist(
        name,
        description ? [description] : [],
        trackIds
      );
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

  // Collaboration requests
  async sendCollabRequest(
    from: bigint,
    to: bigint,
    trackId: bigint,
    message?: string
  ): Promise<CollabRequest | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.send_collab_request(
        from,
        to,
        trackId,
        message ? [message] : []
      );
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      return null;
    }
  }

  async respondCollabRequest(requestId: bigint, accept: boolean): Promise<CollabRequest | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.respond_collab_request(requestId, accept);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error responding to collaboration request:', error);
      return null;
    }
  }

  async listCollabRequestsForUser(userId: bigint): Promise<CollabRequest[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_collab_requests_for_user(userId);
    } catch (error) {
      console.error('Error listing collaboration requests:', error);
      return [];
    }
  }

  // Task management
  async createTask(trackId: bigint, assignedTo: bigint, description: string): Promise<Task | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_task(trackId, assignedTo, description);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  async updateTaskStatus(taskId: bigint, status: TaskStatus): Promise<Task | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.update_task_status(taskId, { [status]: null });
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating task status:', error);
      return null;
    }
  }

  async listTasksForTrack(trackId: bigint): Promise<Task[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_tasks_for_track(trackId);
    } catch (error) {
      console.error('Error listing tasks for track:', error);
      return [];
    }
  }

  async listTasksForUser(userId: bigint): Promise<Task[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_tasks_for_user(userId);
    } catch (error) {
      console.error('Error listing tasks for user:', error);
      return [];
    }
  }

  // Workflow management
  async createWorkflowStep(
    trackId: bigint,
    stepName: string,
    assignedTo: bigint[],
    dueDate?: bigint,
    notes?: string
  ): Promise<WorkflowStep | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_workflow_step(
        trackId,
        stepName,
        assignedTo,
        dueDate ? [dueDate] : [],
        notes ? [notes] : []
      );
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating workflow step:', error);
      return null;
    }
  }

  async updateWorkflowStepStatus(stepId: bigint, status: WorkflowStatus, notes?: string): Promise<WorkflowStep | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.update_workflow_step_status(stepId, { [status]: null }, notes ? [notes] : []);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error updating workflow step status:', error);
      return null;
    }
  }

  async getTrackWorkflowSteps(trackId: bigint): Promise<WorkflowStep[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_track_workflow_steps(trackId);
    } catch (error) {
      console.error('Error getting track workflow steps:', error);
      return [];
    }
  }

  async createCollaborationSession(trackId: bigint, sessionName: string, participants: bigint[], notes?: string): Promise<CollaborationSession | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      const result = await actor.create_collaboration_session(trackId, sessionName, participants, notes ? [notes] : []);
      return result && result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      return null;
    }
  }

  async getTrackCollaborationSessions(trackId: bigint): Promise<CollaborationSession[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_track_collaboration_sessions(trackId);
    } catch (error) {
      console.error('Error getting track collaboration sessions:', error);
      return [];
    }
  }

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_workflow_templates();
    } catch (error) {
      console.error('Error getting workflow templates:', error);
      return [];
    }
  }

  async getWorkflowTemplatesByGenre(genre: string): Promise<WorkflowTemplate[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_workflow_templates_by_genre(genre);
    } catch (error) {
      console.error('Error getting workflow templates by genre:', error);
      return [];
    }
  }

  // Advanced Analytics
  async getRevenueInsights(): Promise<RevenueInsights | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      return await actor.get_revenue_insights();
    } catch (error) {
      console.error('Error getting revenue insights:', error);
      return null;
    }
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics | null> {
    const actor = icpService.getActor();
    if (!actor) return null;

    try {
      return await actor.get_platform_analytics();
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      return null;
    }
  }

  // User Activity
  async getUserActivity(userId: bigint): Promise<Activity[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_user_activity(userId);
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  // Message Management
  async markMessageRead(messageId: bigint): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.mark_message_read(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Payment History
  async getPaymentHistory(artistId: bigint): Promise<Payment[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.get_payment_history(artistId);
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Admin Features
  async listReports(): Promise<Report[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_reports();
    } catch (error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }

  async reviewReport(reportId: bigint, status: ReportStatus, notes?: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.review_report(reportId, { [status]: null }, notes ? [notes] : []);
    } catch (error) {
      console.error('Error reviewing report:', error);
      return false;
    }
  }

  async listModerationQueue(): Promise<ModerationQueueItem[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_moderation_queue();
    } catch (error) {
      console.error('Error listing moderation queue:', error);
      return [];
    }
  }

  async reviewModerationItem(itemId: bigint, status: ModerationStatus, notes?: string): Promise<boolean> {
    const actor = icpService.getActor();
    if (!actor) return false;

    try {
      return await actor.review_moderation_item(itemId, { [status]: null }, notes ? [notes] : []);
    } catch (error) {
      console.error('Error reviewing moderation item:', error);
      return false;
    }
  }

  async listSuspensions(): Promise<Suspension[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_suspensions();
    } catch (error) {
      console.error('Error listing suspensions:', error);
      return [];
    }
  }

  async listSuspensionAppeals(): Promise<SuspensionAppeal[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_suspension_appeals();
    } catch (error) {
      console.error('Error listing suspension appeals:', error);
      return [];
    }
  }

  async listAuditLog(): Promise<AuditLogEntry[]> {
    const actor = icpService.getActor();
    if (!actor) return [];

    try {
      return await actor.list_audit_log();
    } catch (error) {
      console.error('Error listing audit log:', error);
      return [];
    }
  }
}

export const musicService = new MusicService();
