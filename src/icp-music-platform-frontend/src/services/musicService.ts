import type { ActorSubclass } from '@dfinity/agent';
import type { _SERVICE } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
import { createActor, canisterId } from '../../../declarations/icp-music-platform-backend';

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