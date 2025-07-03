import React, { useEffect, useState } from 'react';
import { listArtists } from '../services/musicService';

const ArtistList: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listArtists();
        setArtists(data);
      } catch (e) {
        setError('Failed to load artists.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading artists...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Artist List</h2>
      {artists.length === 0 ? (
        <p>No artists found.</p>
      ) : (
        <ul>
          {artists.map((artist, idx) => (
            <li key={idx} style={{ marginBottom: 16 }}>
              <strong>{artist.name}</strong> <br />
              <span>{artist.bio}</span> <br />
              <button disabled>View Details</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistList; 