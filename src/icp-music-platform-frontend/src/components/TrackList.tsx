import { useState } from 'react';
import type { Track } from '../services/musicService';
import './TrackList.css';

interface TrackListProps {
  tracks: Track[];
  loading: boolean;
  onRate?: (trackId: bigint, rating: number) => Promise<boolean>;
  onComment?: (trackId: bigint, text: string) => Promise<boolean>;
}

export const TrackList = ({ tracks, loading, onRate, onComment }: TrackListProps) => {
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [expandedTrack, setExpandedTrack] = useState<bigint | null>(null);

  const handleRate = async (trackId: bigint, rating: number) => {
    if (onRate) {
      await onRate(trackId, rating);
    }
  };

  const handleComment = async (trackId: bigint) => {
    const text = commentTexts[trackId.toString()];
    if (text && onComment) {
      const success = await onComment(trackId, text);
      if (success) {
        setCommentTexts(prev => ({ ...prev, [trackId.toString()]: '' }));
      }
    }
  };

  const getAverageRating = (ratings: [bigint, number][]) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, [, rating]) => acc + rating, 0);
    return sum / ratings.length;
  };

  if (loading) {
    return (
      <div className="track-list-loading">
        <div className="spinner-large"></div>
        <p>Loading tracks...</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="no-tracks">
        <h3>No tracks found</h3>
        <p>Be the first to create a track!</p>
      </div>
    );
  }

  return (
    <div className="track-list">
      {tracks.map((track) => (
        <div key={track.id.toString()} className="track-card">
          <div className="track-header">
            <h3 className="track-title">{track.title}</h3>
            <div className="track-meta">
              <span className="track-version">v{track.version}</span>
              <span className="track-visibility">{track.visibility}</span>
            </div>
          </div>

          <p className="track-description">{track.description}</p>

          <div className="track-info">
            <div className="track-stats">
              <span className="play-count">▶️ {track.play_count.toString()} plays</span>
              <span className="rating">
                ⭐ {getAverageRating(track.ratings).toFixed(1)} ({track.ratings.length} ratings)
              </span>
              <span className="comments-count">💬 {track.comments.length} comments</span>
            </div>

            {track.tags.length > 0 && (
              <div className="track-tags">
                {track.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            {track.genre && (
              <div className="track-genre">
                <span className="genre">🎵 {track.genre}</span>
              </div>
            )}
          </div>

          <div className="track-actions">
            <button
              className="expand-button"
              onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
            >
              {expandedTrack === track.id ? 'Collapse' : 'View Details'}
            </button>

            {onRate && (
              <div className="rating-section">
                <span>Rate:</span>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className="star-button"
                    onClick={() => handleRate(track.id, rating)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            )}
          </div>

          {expandedTrack === track.id && (
            <div className="track-details">
              <div className="comments-section">
                <h4>Comments</h4>
                {track.comments.length > 0 ? (
                  <div className="comments-list">
                    {track.comments.map((comment, index) => (
                      <div key={index} className="comment">
                        <span className="commenter">Artist {comment.commenter.toString()}:</span>
                        <span className="comment-text">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comments">No comments yet.</p>
                )}

                {onComment && (
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentTexts[track.id.toString()] || ''}
                      onChange={(e) =>
                        setCommentTexts(prev => ({ ...prev, [track.id.toString()]: e.target.value }))
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleComment(track.id)}
                    />
                    <button onClick={() => handleComment(track.id)}>
                      Send
                    </button>
                  </div>
                )}
              </div>

              <div className="contributors-section">
                <h4>Contributors</h4>
                <div className="contributors-list">
                  {track.contributors.map((contributorId) => (
                    <span key={contributorId.toString()} className="contributor">
                      Artist {contributorId.toString()}
                    </span>
                  ))}
                </div>
              </div>

              {track.splits && track.splits.length > 0 && (
                <div className="splits-section">
                  <h4>Revenue Splits</h4>
                  <div className="splits-list">
                    {track.splits.map((split, index) => (
                      <div key={index} className="split">
                        <span>Artist {split.id.toString()}: {split.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
