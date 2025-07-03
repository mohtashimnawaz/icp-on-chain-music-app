import React, { useEffect, useState } from 'react';
import { listReports, reviewReport } from '../services/musicService';
import type { Report, ReportStatus } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

const STATUS_OPTIONS: { label: string; value: ReportStatus }[] = [
  { label: 'Pending', value: { Pending: null } },
  { label: 'Reviewed', value: { Reviewed: null } },
  { label: 'Dismissed', value: { Dismissed: null } },
  { label: 'Resolved', value: { Resolved: null } },
];

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<bigint | null>(null);
  const [success, setSuccess] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listReports();
      setReports(data);
    } catch {
      setError('Failed to load reports.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleReview = async (id: bigint, status: ReportStatus) => {
    setReviewing(id);
    setSuccess('');
    try {
      const ok = await reviewReport(id, status);
      if (ok) {
        setSuccess('Report updated.');
        fetchReports();
      } else {
        setError('Failed to update report.');
      }
    } catch {
      setError('Failed to update report.');
    }
    setReviewing(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin: Reports Moderation</h2>
      {loading && <div>Loading reports...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th>
            <th>Type</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.id.toString()} style={{ borderBottom: '1px solid #eee' }}>
              <td>{r.id.toString()}</td>
              <td>{Object.keys(r.target_type)[0]}</td>
              <td>{r.target_id}</td>
              <td>{r.reason}</td>
              <td>{Object.keys(r.status)[0]}</td>
              <td>{r.details && r.details[0]}</td>
              <td>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={Object.keys(opt.value)[0]}
                    onClick={() => handleReview(r.id, opt.value)}
                    disabled={reviewing === r.id || Object.keys(r.status)[0] === Object.keys(opt.value)[0]}
                    style={{ marginRight: 4 }}
                  >
                    {Object.keys(opt.value)[0]}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reports.length === 0 && !loading && <div>No reports found.</div>}
    </div>
  );
};

export default AdminReports; 