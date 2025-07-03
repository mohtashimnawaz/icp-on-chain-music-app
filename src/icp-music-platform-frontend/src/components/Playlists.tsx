import React, { useEffect, useState } from 'react';
import { listPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../services/musicService';

const Playlists: React.FC = () => {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [form, setForm] = useState({ name: '', description: '', tracks: '' });

  const fetchPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listPlaylists();
      setPlaylists(data);
    } catch {
      setError('Failed to load playlists.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleCreate = async () => {
    setError(''); setSuccess('');
    try {
      const trackIds = form.tracks.split(',').map(t => t.trim()).filter(Boolean).map(t => BigInt(t));
      await createPlaylist(form.name, form.description, trackIds);
      setSuccess('Playlist created!');
      setForm({ name: '', description: '', tracks: '' });
      setCreating(false);
      fetchPlaylists();
    } catch { setError('Failed to create playlist.'); }
  };

  const handleEdit = (pl: any) => {
    setEditingId(pl.id);
    setForm({ name: pl.name, description: pl.description?.[0] || '', tracks: pl.track_ids.join(', ') });
  };

  const handleUpdate = async () => {
    setError(''); setSuccess('');
    try {
      const trackIds = form.tracks.split(',').map(t => t.trim()).filter(Boolean).map(t => BigInt(t));
      await updatePlaylist(editingId!, form.name, form.description, trackIds);
      setSuccess('Playlist updated!');
      setEditingId(null);
      setForm({ name: '', description: '', tracks: '' });
      fetchPlaylists();
    } catch { setError('Failed to update playlist.'); }
  };

  const handleDelete = async (id: bigint) => {
    setError(''); setSuccess('');
    try {
      await deletePlaylist(id);
      setSuccess('Playlist deleted!');
      fetchPlaylists();
    } catch { setError('Failed to delete playlist.'); }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Playlists</h2>
      {loading && <div>Loading playlists...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button onClick={() => { setCreating(true); setEditingId(null); setForm({ name: '', description: '', tracks: '' }); }} style={{ marginBottom: 16 }}>Create Playlist</button>
      {(creating || editingId) && (
        <div style={{ marginBottom: 16 }}>
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ marginRight: 8 }} />
          <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ marginRight: 8 }} />
          <input type="text" placeholder="Track IDs (comma separated)" value={form.tracks} onChange={e => setForm(f => ({ ...f, tracks: e.target.value }))} style={{ marginRight: 8 }} />
          {creating ? (
            <button onClick={handleCreate}>Create</button>
          ) : (
            <button onClick={handleUpdate}>Update</button>
          )}
          <button onClick={() => { setCreating(false); setEditingId(null); setForm({ name: '', description: '', tracks: '' }); }} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      )}
      <ul>
        {playlists.map((pl, i) => (
          <li key={i} style={{ marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <strong>{pl.name}</strong> <br />
            <span>{pl.description?.[0]}</span> <br />
            <span>Tracks: {pl.track_ids.join(', ')}</span> <br />
            <button onClick={() => handleEdit(pl)} style={{ marginRight: 8 }}>Edit</button>
            <button onClick={() => handleDelete(pl.id)} style={{ color: 'red' }}>Delete</button>
          </li>
        ))}
      </ul>
      {playlists.length === 0 && !loading && <div>No playlists found.</div>}
    </div>
  );
};

export default Playlists; 