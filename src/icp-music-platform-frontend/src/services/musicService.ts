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