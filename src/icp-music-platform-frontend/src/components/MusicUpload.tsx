import React, { useState } from 'react';

const MusicUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tracks, setTracks] = useState<string[]>(["Sample Track 1", "Sample Track 2"]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setTracks([...tracks, selectedFile.name]);
      setSelectedFile(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload Music</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: 8 }}>
        Upload
      </button>
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