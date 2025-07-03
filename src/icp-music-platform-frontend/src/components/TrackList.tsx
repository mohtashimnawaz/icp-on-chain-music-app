import React, { useEffect, useState } from 'react';
import { listTracks, rateTrack, addComment, deleteTrack, updateTrack, getTrackFileDownload } from '../services/musicService';

const TrackList: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<{ [id: string]: number }>({});
  const [comment, setComment] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [id: string]: boolean }>({});
  const [actionError, setActionError] = useState<{ [id: string]: string | null }>({});
  const [editMode, setEditMode] = useState<{ [id: string]: boolean }>({});
  const [editFields, setEditFields] = useState<{ [id: string]: { title: string; description: string; contributors: string } }>({});

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTracks();
      setTracks(data);
    } catch (e) {
      setError('Failed to load tracks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleRate = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      // For demo, use userId = 1n
      await rateTrack(trackId, 1n, rating[trackId.toString()] || 1);
      await fetchTracks();
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to rate track.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleComment = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      // For demo, use commenter = 1n
      await addComment(trackId, 1n, comment[trackId.toString()] || '');
      await fetchTracks();
      setComment((prev) => ({ ...prev, [trackId.toString()]: '' }));
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to add comment.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleDelete = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      await deleteTrack(trackId);
      await fetchTracks();
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to delete track.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleEdit = (track: any) => {
    setEditMode((prev) => ({ ...prev, [track.id.toString()]: true }));
    setEditFields((prev) => ({ ...prev, [track.id.toString()]: {
      title: track.title,
      description: track.description,
      contributors: track.contributors?.join(', ') || ''
    }}));
  };

  const handleEditChange = (trackId: bigint, field: string, value: string) => {
    setEditFields((prev) => ({
      ...prev,
      [trackId.toString()]: {
        ...prev[trackId.toString()],
        [field]: value
      }
    }));
  };

  const handleEditSave = async (track: any) => {
    setActionLoading((prev) => ({ ...prev, [track.id.toString()]: true }));
    setActionError((prev) => ({ ...prev, [track.id.toString()]: null }));
    try {
      const contributorsArr = editFields[track.id.toString()].contributors.split(',').map((id: string) => BigInt(id.trim())).filter(Boolean);
      await updateTrack(track.id, editFields[track.id.toString()].title, editFields[track.id.toString()].description, contributorsArr, track.version);
      setEditMode((prev) => ({ ...prev, [track.id.toString()]: false }));
      await fetchTracks();
    } catch (e) {
      setActionError((prev) => ({ ...prev, [track.id.toString()]: 'Failed to update track.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [track.id.toString()]: false }));
    }
  };

  const handleEditCancel = (trackId: bigint) => {
    setEditMode((prev) => ({ ...prev, [trackId.toString()]: false }));
  };

  const handleDownload = async (trackId: bigint, title: string) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      const file = await getTrackFileDownload(trackId);
      if (file && file.length > 0 && typeof file[0] === 'object' && 'data' in file[0]) {
        const trackFile = file[0] as { data: number[]; content_type?: string; filename?: string };
        const blob = new Blob([new Uint8Array(trackFile.data)], { type: trackFile.content_type || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = trackFile.filename || `${title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setActionError((prev) => ({ ...prev, [trackId.toString()]: 'No file found for this track.' }));
      }
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to download file.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading tracks...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Track List</h2>
      {tracks.length === 0 ? (
        <p>No tracks found.</p>
      ) : (
        <ul>
          {tracks.map((track, idx) => (
            <li key={idx} style={{ marginBottom: 24, borderBottom: '1px solid #444', paddingBottom: 16 }}>
              {editMode[track.id.toString()] ? (
                <div>
                  <input
                    type="text"
                    value={editFields[track.id.toString()]?.title || ''}
                    onChange={e => handleEditChange(track.id, 'title', e.target.value)}
                    disabled={actionLoading[track.id.toString()]}
                    style={{ marginBottom: 4 }}
                  />
                  <br />
                  <input
                    type="text"
                    value={editFields[track.id.toString()]?.description || ''}
                    onChange={e => handleEditChange(track.id, 'description', e.target.value)}
                    disabled={actionLoading[track.id.toString()]}
                    style={{ marginBottom: 4 }}
                  />
                  <br />
                  <input
                    type="text"
                    value={editFields[track.id.toString()]?.contributors || ''}
                    onChange={e => handleEditChange(track.id, 'contributors', e.target.value)}
                    disabled={actionLoading[track.id.toString()]}
                    style={{ marginBottom: 4 }}
                  />
                  <br />
                  <button onClick={() => handleEditSave(track)} disabled={actionLoading[track.id.toString()]}>Save</button>
                  <button onClick={() => handleEditCancel(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
              ) : (
                <>
                  <strong>{track.title}</strong> <br />
                  <span>{track.description}</span> <br />
                  <span>Contributors: {track.contributors?.join(', ')}</span> <br />
                  <span>Play count: {track.play_count ?? 0}</span> <br />
                  <span>Average rating: {track.ratings && track.ratings.length > 0 ? (track.ratings.reduce((acc: number, r: any) => acc + r[1], 0) / track.ratings.length).toFixed(2) : 'N/A'}</span>
                  <div style={{ marginTop: 8 }}>
                    <label>Rate: </label>
                    <select
                      value={rating[track.id.toString()] || 1}
                      onChange={e => setRating(prev => ({ ...prev, [track.id.toString()]: Number(e.target.value) }))}
                      disabled={actionLoading[track.id.toString()]}
                    >
                      {[1, 2, 3, 4, 5].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                    <button onClick={() => handleRate(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginLeft: 8 }}>
                      {actionLoading[track.id.toString()] ? 'Rating...' : 'Rate'}
                    </button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label>Comment: </label>
                    <input
                      type="text"
                      value={comment[track.id.toString()] || ''}
                      onChange={e => setComment(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ width: 200 }}
                    />
                    <button onClick={() => handleComment(track.id)} disabled={actionLoading[track.id.toString()] || !(comment[track.id.toString()] && comment[track.id.toString()].trim())} style={{ marginLeft: 8 }}>
                      {actionLoading[track.id.toString()] ? 'Commenting...' : 'Add Comment'}
                    </button>
                  </div>
                  <button onClick={() => handleEdit(track)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8, marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8, marginRight: 8, color: 'red' }}>Delete</button>
                  <button onClick={() => handleDownload(track.id, track.title)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8 }}>Download</button>
                </>
              )}
              {actionError[track.id.toString()] && <div style={{ color: 'red', marginTop: 4 }}>{actionError[track.id.toString()]}</div>}
              {track.comments && track.comments.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Comments:</strong>
                  <ul>
                    {track.comments.map((c: any, i: number) => (
                      <li key={i}>{c.text} (by {c.commenter})</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackList; 