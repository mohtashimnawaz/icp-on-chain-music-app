import React, { useEffect, useState } from 'react';
import { listReports, reviewReport } from '../services/musicService';
import type { Report, ReportStatus } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ReportIcon from '@mui/icons-material/Report';

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
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Card sx={{
        background: 'linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 8s ease-in-out infinite',
        boxShadow: '0 8px 32px 0 rgba(123,31,162,0.18)',
        borderRadius: 4,
        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.04)',
          boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
        },
        mb: 4
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ReportIcon sx={{ fontSize: 40, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h4" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
              ml: 2
            }}>
              Admin Reports
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Review and manage all user reports in a beautiful, immersive admin panel.
          </Typography>
        </CardContent>
      </Card>
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
    </Box>
  );
};

export default AdminReports; 