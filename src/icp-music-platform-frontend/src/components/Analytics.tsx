import React from 'react';

const Analytics: React.FC = () => {
  // Mock data
  const stats = {
    uploads: 12,
    plays: 340,
    collaborators: 5,
    topTrack: "Sample Track 1",
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Analytics</h2>
      <ul>
        <li>Total uploads: {stats.uploads}</li>
        <li>Total plays: {stats.plays}</li>
        <li>Collaborators: {stats.collaborators}</li>
        <li>Top track: {stats.topTrack}</li>
      </ul>
      <h3 style={{ marginTop: '2rem' }}>Track Plays (Mock Chart)</h3>
      <pre style={{ background: '#222', color: '#ffd700', padding: '1rem', borderRadius: 8 }}>
        {`Sample Track 1: ${'█'.repeat(10)} 100 plays\nSample Track 2: ${'█'.repeat(5)} 50 plays`}
      </pre>
    </div>
  );
};

export default Analytics; 