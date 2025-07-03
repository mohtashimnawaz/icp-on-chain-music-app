import React, { useState } from 'react';
import { registerArtist } from '../services/musicService';

const ArtistRegister: React.FC = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [social, setSocial] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [links, setLinks] = useState(''); // comma-separated
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !bio) {
      setMessage('Name and bio are required.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const linksArr = links.split(',').map(l => l.trim()).filter(Boolean);
      await registerArtist(name, bio, social, profileImageUrl, linksArr);
      setMessage('Artist registered successfully!');
      setName('');
      setBio('');
      setSocial('');
      setProfileImageUrl('');
      setLinks('');
    } catch (e) {
      setMessage('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Register Artist</h2>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Social" value={social} onChange={e => setSocial(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Profile Image URL" value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <input type="text" placeholder="Links (comma-separated)" value={links} onChange={e => setLinks(e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
      <button onClick={handleRegister} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default ArtistRegister; 