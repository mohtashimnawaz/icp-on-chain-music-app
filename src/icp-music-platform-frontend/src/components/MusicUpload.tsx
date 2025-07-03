import React, { useState } from 'react';
import { uploadTrackFile } from '../services/musicService';

const MusicUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tracks, setTracks] = useState<string[]>(["Sample Track 1", "Sample Track 2"]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setLoading(true);
      setMessage(null);
      try {
        // Use file name as track ID for testing
        await uploadTrackFile(selectedFile.name, selectedFile);
        setTracks([...tracks, selectedFile.name]);
        setMessage('Upload successful!');
      } catch (e) {
        setMessage('Upload failed.');
      } finally {
        setLoading(false);
        setSelectedFile(null);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload Music</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading} style={{ marginLeft: 8 }}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
      <h3 style={{ marginTop: '2rem' }}>Your Tracks</h3>
      <ul>
        {tracks.map((track, idx) => (
          <li key={idx}>{track}</li>
        ))}
      </ul>
    </div>
  );
};

export default MusicUpload; 