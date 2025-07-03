import React, { useState } from 'react';
import { createTrack, uploadTrackFile } from '../services/musicService';

const MusicUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contributors, setContributors] = useState(''); // comma-separated user IDs
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !description || !contributors) {
      setMessage('Please fill all fields and select a file.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      // Parse contributors as array of BigInt
      const contributorIds = contributors.split(',').map(id => BigInt(id.trim())).filter(Boolean);
      // 1. Create the track
      const created = await createTrack(title, description, contributorIds);
      if (!created || !created[0] || !created[0].id) {
        setMessage('Track creation failed.');
        setLoading(false);
        return;
      }
      const trackId = created[0].id;
      // 2. Upload the file for the new track
      await uploadTrackFile(trackId.toString(), selectedFile);
      setMessage('Track and file uploaded successfully!');
      setTitle('');
      setDescription('');
      setContributors('');
      setSelectedFile(null);
    } catch (e) {
      setMessage('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload Music</h2>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Contributors (comma-separated user IDs)" value={contributors} onChange={e => setContributors(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading} style={{ marginLeft: 8 }}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default MusicUpload; 