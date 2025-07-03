import type { ActorSubclass } from '@dfinity/agent';
import type { _SERVICE } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
import { createActor, canisterId } from '../../../declarations/icp-music-platform-backend';
import { Principal } from '@dfinity/principal';
import type { CollabRequest, Task, TaskStatus, CollaborationSession } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
import { icp_music_platform_backend } from '../../../declarations/icp-music-platform-backend';
import type { Report, ReportStatus, ReportTargetType } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

let actor: ActorSubclass<_SERVICE> | null = null;

export function getMusicActor(): ActorSubclass<_SERVICE> {
  if (!actor) {
    actor = createActor(canisterId, {});
  }
  return actor;
}

export async function uploadTrackFile(trackId: string, file: File): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const data = Array.from(new Uint8Array(arrayBuffer));
  await getMusicActor().upload_track_file(
    trackId,
    data
  );
}

export async function getTrackFile(trackId: string): Promise<Uint8Array | number[] | null> {
  const file = await getMusicActor().get_track_file(trackId);
  if (file && file.length > 0 && file[0] !== undefined) {
    return file[0];
  }
  return null;
}

export async function listTracks() {
  return await getMusicActor().list_tracks();
}

export async function getTrack(id: bigint) {
  return await getMusicActor().get_track(id);
}

export async function createTrack(title: string, description: string, contributors: bigint[]): Promise<any> {
  return await getMusicActor().create_track(title, description, contributors);
}

export async function addComment(trackId: bigint, commenter: bigint, text: string) {
  return await getMusicActor().add_comment(trackId, commenter, text);
}

export async function rateTrack(trackId: bigint, userId: bigint, rating: number) {
  return await getMusicActor().rate_track(trackId, userId, rating);
}

export async function deleteTrack(trackId: bigint) {
  return await getMusicActor().delete_track(trackId);
}

export async function updateTrack(id: bigint, title: string, description: string, contributors: bigint[], version: number) {
  return await getMusicActor().update_track(id, title, description, contributors, version);
}

export async function getTrackFileDownload(trackId: bigint) {
  return await getMusicActor().get_track_file(trackId.toString());
}

export async function registerArtist(name: string, bio: string, social?: string, profileImageUrl?: string, links?: string[]): Promise<any> {
  return await getMusicActor().register_artist(name, bio, social ? [social] : [], profileImageUrl ? [profileImageUrl] : [], links ? [links] : []);
}

export async function listArtists() {
  return await getMusicActor().list_artists();
}

export async function getArtist(id: bigint) {
  return await getMusicActor().get_artist(id);
}

export async function updateArtist(id: bigint, name: string, bio: string, social?: string, profileImageUrl?: string, links?: string[]): Promise<any> {
  return await getMusicActor().update_artist(id, name, bio, social ? [social] : [], profileImageUrl ? [profileImageUrl] : [], links ? [links] : []);
}

export async function followArtist(principal: string) {
  return await getMusicActor().follow_artist(Principal.fromText(principal));
}

export async function unfollowArtist(principal: string) {
  return await getMusicActor().unfollow_artist(Principal.fromText(principal));
}

export async function getUserEngagementMetrics(userId: bigint) {
  return await getMusicActor().get_user_engagement_metrics(userId);
}

export async function searchTracksByContributor(artistId: bigint) {
  return await getMusicActor().search_tracks_by_contributor(artistId);
}

export async function listFollowedArtists() {
  return await getMusicActor().list_followed_artists();
}

export async function sendCollabRequest(from: bigint, to: bigint, trackId: bigint, message?: string): Promise<CollabRequest | null> {
  const result = await icp_music_platform_backend.send_collab_request(from, to, trackId, message ? [message] : []);
  return result[0] ?? null;
}

export async function respondCollabRequest(requestId: bigint, accept: boolean): Promise<CollabRequest | null> {
  const result = await icp_music_platform_backend.respond_collab_request(requestId, accept);
  return result[0] ?? null;
}

export async function listCollabRequestsForUser(userId: bigint): Promise<CollabRequest[]> {
  return await icp_music_platform_backend.list_collab_requests_for_user(userId);
}

export async function createTask(trackId: bigint, assignedTo: bigint, description: string): Promise<Task | null> {
  const result = await icp_music_platform_backend.create_task(trackId, assignedTo, description);
  return result[0] ?? null;
}

export async function updateTaskStatus(taskId: bigint, status: TaskStatus): Promise<Task | null> {
  const result = await icp_music_platform_backend.update_task_status(taskId, status);
  return result[0] ?? null;
}

export async function listTasksForTrack(trackId: bigint): Promise<Task[]> {
  return await icp_music_platform_backend.list_tasks_for_track(trackId);
}

export async function listTasksForUser(userId: bigint): Promise<Task[]> {
  return await icp_music_platform_backend.list_tasks_for_user(userId);
}

export async function createCollaborationSession(trackId: bigint, sessionName: string, participants: bigint[], notes?: string): Promise<CollaborationSession | null> {
  const result = await icp_music_platform_backend.create_collaboration_session(trackId, sessionName, participants, notes ? [notes] : []);
  return result[0] ?? null;
}

export async function endCollaborationSession(sessionId: bigint, notes?: string): Promise<CollaborationSession | null> {
  const result = await icp_music_platform_backend.end_collaboration_session(sessionId, notes ? [notes] : []);
  return result[0] ?? null;
}

export async function getTrackCollaborationSessions(trackId: bigint): Promise<CollaborationSession[]> {
  return await icp_music_platform_backend.get_track_collaboration_sessions(trackId);
}

export async function sendMessage(to: Principal, content: string): Promise<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint } | null> {
  const result = await icp_music_platform_backend.send_message(to, content);
  return result[0] ?? null;
}

export async function listMessagesWith(user: Principal): Promise<Array<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint }>> {
  return await icp_music_platform_backend.list_messages_with(user);
}

export async function markMessageRead(messageId: bigint): Promise<boolean> {
  return await icp_music_platform_backend.mark_message_read(messageId);
}

export async function reportContent(targetType: ReportTargetType, targetId: string, reason: string, details?: string): Promise<Report | null> {
  const result = await icp_music_platform_backend.report_content(targetType, targetId, reason, details ? [details] : []);
  return result[0] ?? null;
}

export async function listReports(): Promise<Report[]> {
  return await icp_music_platform_backend.list_reports();
}

export async function reviewReport(reportId: bigint, status: ReportStatus, resolutionNotes?: string): Promise<boolean> {
  return await icp_music_platform_backend.review_report(reportId, status, resolutionNotes ? [resolutionNotes] : []);
}

export async function getPlatformAnalytics() {
  return await getMusicActor().get_platform_analytics();
}

export async function listPlaylists() {
  return await getMusicActor().list_playlists();
}

export async function createPlaylist(name: string, description: string, trackIds: bigint[]) {
  return await getMusicActor().create_playlist(name, description ? [description] : [], trackIds);
}

export async function updatePlaylist(id: bigint, name: string, description: string, trackIds: bigint[]) {
  return await getMusicActor().update_playlist(id, name, description ? [description] : [], trackIds);
}

export async function deletePlaylist(id: bigint) {
  return await getMusicActor().delete_playlist(id);
}

export async function getPlaylist(id: bigint) {
  return await getMusicActor().get_playlist(id);
} 