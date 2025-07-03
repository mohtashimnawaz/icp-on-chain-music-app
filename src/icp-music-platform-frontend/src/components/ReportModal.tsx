import React, { useState } from 'react';
import type { ReportTargetType } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  targetType: ReportTargetType;
  targetId: string;
}

const REASONS = [
  'Spam',
  'Inappropriate Content',
  'Harassment',
  'Copyright Violation',
  'Other',
];

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, onSubmit, targetType, targetId }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await onSubmit(reason, details);
      setSuccess(true);
      setDetails('');
    } catch {
      setError('Failed to submit report.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <h3>Report {Object.keys(targetType)[0]}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Reason:</label><br />
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%' }}>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Details (optional):</label><br />
            <textarea value={details} onChange={e => setDetails(e.target.value)} style={{ width: '100%' }} rows={3} />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 8 }}>Report submitted. Thank you!</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ marginRight: 8 }} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal; 