import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArtist, updateArtist, followArtist, unfollowArtist, getUserEngagementMetrics, searchTracksByContributor, listFollowedArtists } from '../services/musicService';

type LocalArtist = {
  id: bigint;
  name: string;
  bio: string;
  social: string;
  profile_image_url: string;
  links: string[];
  user_principal?: any;
};

const ArtistProfile: React.FC = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState<LocalArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [fields, setFields] = useState({ name: '', bio: '', social: '', profileImageUrl: '', links: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getArtist(BigInt(id!));
        if (data && data[0]) {
          const artistData = data[0];
          const social = Array.isArray(artistData.social) && artistData.social.length > 0 ? artistData.social[0] : '';
          const profileImageUrl = Array.isArray(artistData.profile_image_url) && artistData.profile_image_url.length > 0 ? artistData.profile_image_url[0] : '';
          const linksArr = Array.isArray(artistData.links) && artistData.links.length > 0 && Array.isArray(artistData.links[0]) ? artistData.links[0] : [];
          const links = linksArr.length > 0 ? linksArr.join(', ') : '';
          setArtist({
            id: artistData.id,
            name: artistData.name,
            bio: artistData.bio,
            social,
            profile_image_url: profileImageUrl,
            links: linksArr,
            user_principal: artistData.user_principal
          });
          setFields({
            name: artistData.name,
            bio: artistData.bio,
            social,
            profileImageUrl,
            links
          });
        } else {
          setError('Artist not found.');
        }
        // Fetch tracks by this artist
        const tracksData = await searchTracksByContributor(BigInt(id!));
        setTracks(tracksData);
        // Fetch analytics
        const analyticsData = await getUserEngagementMetrics(BigInt(id!));
        setAnalytics(analyticsData && analyticsData[0] ? analyticsData[0] : null);
        // Fetch followed artists for current user (demo: just check if artist id is in list)
        const followed = await listFollowedArtists();
        setIsFollowing(Array.isArray(followed) && followed.some((p: any) => artist && artist.user_principal && p.toString() === artist.user_principal.toString()));
        // For demo, set followers/following from analytics if available
        if (analyticsData && analyticsData[0]) {
          setFollowers(Number(analyticsData[0].followers_count || 0));
          setFollowing(Number(analyticsData[0].following_count || 0));
        }
      } catch (e) {
        setError('Failed to load artist.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleChange = (field: string, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setActionLoading(true);
    setActionError(null);
    setMessage(null);
    try {
      const linksArr = fields.links.split(',').map(l => l.trim()).filter(Boolean);
      await updateArtist(BigInt(id!), fields.name, fields.bio, fields.social, fields.profileImageUrl, linksArr);
      setMessage('Profile updated!');
      setEditMode(false);
      // Refresh artist
      const data = await getArtist(BigInt(id!));
      if (data && data[0]) setArtist(data[0]);
    } catch (e) {
      setActionError('Failed to update profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollow = async () => {
    setActionLoading(true);
    setActionError(null);
    setMessage(null);
    try {
      await followArtist(artist.user_principal.toString());
      setMessage('Followed!');
    } catch (e) {
      setActionError('Failed to follow.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setActionLoading(true);
    setActionError(null);
    setMessage(null);
    try {
      await unfollowArtist(artist.user_principal.toString());
      setMessage('Unfollowed!');
    } catch (e) {
      setActionError('Failed to unfollow.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading artist...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!artist) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Artist Profile</h2>
      {editMode ? (
        <div>
          <input type="text" value={fields.name || ''} onChange={e => handleChange('name', e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
          <input type="text" value={fields.bio || ''} onChange={e => handleChange('bio', e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
          <input type="text" value={fields.social || ''} onChange={e => handleChange('social', e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
          <input type="text" value={fields.profileImageUrl || ''} onChange={e => handleChange('profileImageUrl', e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
          <input type="text" value={fields.links || ''} onChange={e => handleChange('links', e.target.value)} style={{ marginBottom: 8, display: 'block' }} />
          <button onClick={handleSave} disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save'}</button>
          <button onClick={handleCancel} disabled={actionLoading} style={{ marginLeft: 8 }}>Cancel</button>
          {actionError && <div style={{ color: 'red', marginTop: 8 }}>{actionError}</div>}
          {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
        </div>
      ) : (
        <div>
          <strong>{artist.name || ''}</strong> <br />
          <span>{artist.bio || ''}</span> <br />
          {artist.social && <span>Social: {artist.social}</span>} <br />
          {artist.profile_image_url && (
            <span>Profile Image: <img src={artist.profile_image_url} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%' }} /></span>
          )} <br />
          {artist.links && artist.links.length > 0 && (
            <span>Links: {artist.links.join(', ')}</span>
          )} <br />
          <button onClick={handleEdit} style={{ marginTop: 8, marginRight: 8 }}>Edit Profile</button>
          <button onClick={handleFollow} style={{ marginTop: 8, marginRight: 8 }}>Follow</button>
          <button onClick={handleUnfollow} style={{ marginTop: 8 }}>Unfollow</button>
          {actionError && <div style={{ color: 'red', marginTop: 8 }}>{actionError}</div>}
          {message && <div style={{ color: 'green', marginTop: 8 }}>{message}</div>}
          {analytics && (
            <div style={{ marginTop: 16 }}>
              <strong>Analytics:</strong><br />
              Total Tracks Created: {analytics.total_tracks_created}<br />
              Total Plays Received: {analytics.total_plays_received}<br />
              Total Revenue Earned: {analytics.total_revenue_earned}<br />
              Avg Track Rating: {analytics.avg_track_rating}<br />
              Followers: {followers} | Following: {following}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <strong>Tracks by this artist:</strong>
            {tracks.length === 0 ? <div>No tracks found.</div> : (
              <ul>
                {tracks.map((track: any, idx: number) => (
                  <li key={idx}><strong>{track.title}</strong> - {track.description}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile; 