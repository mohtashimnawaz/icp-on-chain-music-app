import React, { useEffect, useState } from 'react';
import { listTracks, rateTrack, addComment, deleteTrack, updateTrack, getTrackFileDownload, reportContent, getTrackLicense, setTrackLicense, getTrackVersions, revertToVersion, compareVersions, getTrackWorkflowSteps, createWorkflowStep, updateWorkflowStepStatus, addTag, removeTag, setGenre, searchTracksByTag, searchTracksByGenre, followTrack, unfollowTrack, listFollowedTracks } from '../services/musicService';
import ReportModal from './ReportModal';
import type { ReportTargetType, LicenseType, TrackLicense, TrackVersion, VersionComparison, WorkflowStatus, WorkflowStep, WorkflowTemplate } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';
// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const TRACK_TARGET_TYPE: ReportTargetType = { Track: null };

const LICENSE_OPTIONS: { label: string; value: LicenseType }[] = [
  { label: 'All Rights Reserved', value: { AllRightsReserved: null } },
  { label: 'Creative Commons', value: { CreativeCommons: null } },
  { label: 'Custom', value: { Custom: null } },
];

// Define Track interface for type safety
interface Track {
  id: bigint;
  title: string;
  description: string;
  // Add other properties as needed
}

const TrackList: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<{ [id: string]: number }>({});
  const [comment, setComment] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [id: string]: boolean }>({});
  const [actionError, setActionError] = useState<{ [id: string]: string | null }>({});
  const [editMode, setEditMode] = useState<{ [id: string]: boolean }>({});
  const [editFields, setEditFields] = useState<{ [id: string]: { title: string; description: string; contributors: string; genre?: string; tags?: string } }>({});
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTrackId, setReportTrackId] = useState<string | null>(null);
  const [reportError, setReportError] = useState('');
  const [license, setLicense] = useState<{ [id: string]: TrackLicense | null }>({});
  const [licenseLoading, setLicenseLoading] = useState<{ [id: string]: boolean }>({});
  const [licenseEdit, setLicenseEdit] = useState<{ [id: string]: boolean }>({});
  const [licenseFields, setLicenseFields] = useState<{ [id: string]: { type: LicenseType; terms: string; contract: string } }>({});
  const [licenseError, setLicenseError] = useState<{ [id: string]: string | null }>({});
  const [versionOpen, setVersionOpen] = useState<{ [id: string]: boolean }>({});
  const [versions, setVersions] = useState<{ [id: string]: TrackVersion[] }>({});
  const [versionLoading, setVersionLoading] = useState<{ [id: string]: boolean }>({});
  const [compareA, setCompareA] = useState<{ [id: string]: string }>({});
  const [compareB, setCompareB] = useState<{ [id: string]: string }>({});
  const [comparison, setComparison] = useState<{ [id: string]: VersionComparison | null }>({});
  const [revertLoading, setRevertLoading] = useState<{ [id: string]: boolean }>({});
  const [versionError, setVersionError] = useState<{ [id: string]: string | null }>({});
  const [workflowOpen, setWorkflowOpen] = useState<{ [id: string]: boolean }>({});
  const [workflowSteps, setWorkflowSteps] = useState<{ [id: string]: WorkflowStep[] }>({});
  const [workflowLoading, setWorkflowLoading] = useState<{ [id: string]: boolean }>({});
  const [workflowError, setWorkflowError] = useState<{ [id: string]: string | null }>({});
  const [newStep, setNewStep] = useState<{ [id: string]: { name: string; assignees: string; due: string; notes: string } }>({});
  const [addStepLoading, setAddStepLoading] = useState<{ [id: string]: boolean }>({});
  const [addStepError, setAddStepError] = useState<{ [id: string]: string | null }>({});
  const [updateStepLoading, setUpdateStepLoading] = useState<{ [id: string]: boolean }>({});
  const [tagSearch, setTagSearch] = useState('');
  const [genreSearch, setGenreSearch] = useState('');
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTracks();
      setTracks(data as Track[]);
    } catch (e) {
      setError('Failed to load tracks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowed = async () => {
    try {
      const ids = await listFollowedTracks();
      const arr = Array.isArray(ids) ? ids : Array.from(ids);
      setFollowed(new Set(arr.map((id: bigint) => id.toString())));
    } catch {}
  };

  useEffect(() => {
    fetchTracks();
    fetchFollowed();
  }, []);

  const handleRate = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      await rateTrack(trackId, 1n, rating[trackId.toString()] || 1);
      await fetchTracks();
      showMessage('Track rated!', 'success');
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to rate track.' }));
      showMessage('Failed to rate track.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleComment = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      await addComment(trackId, 1n, comment[trackId.toString()] || '');
      await fetchTracks();
      setComment((prev) => ({ ...prev, [trackId.toString()]: '' }));
      showMessage('Comment added!', 'success');
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to add comment.' }));
      showMessage('Failed to add comment.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleDelete = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      await deleteTrack(trackId);
      await fetchTracks();
      showMessage('Track deleted.', 'success');
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to delete track.' }));
      showMessage('Failed to delete track.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleEdit = (track: any) => {
    setEditMode((prev) => ({ ...prev, [track.id.toString()]: true }));
    setEditFields((prev) => ({ ...prev, [track.id.toString()]: {
      title: track.title,
      description: track.description,
      contributors: track.contributors?.join(', ') || '',
      genre: typeof track.genre === 'string' ? track.genre : '',
      tags: Array.isArray(track.tags) ? track.tags.join(', ') : ''
    }}));
  };

  const handleEditChange = (trackId: bigint, field: string, value: string) => {
    setEditFields((prev) => ({
      ...prev,
      [trackId.toString()]: {
        ...prev[trackId.toString()],
        [field]: value
      }
    }));
  };

  const handleEditSave = async (track: any) => {
    setActionLoading((prev) => ({ ...prev, [track.id.toString()]: true }));
    setActionError((prev) => ({ ...prev, [track.id.toString()]: null }));
    try {
      const ef = editFields[track.id.toString()] || {};
      const contributorsArr = (ef.contributors || '').split(',').map((id: string) => BigInt(id.trim())).filter(Boolean);
      await updateTrack(track.id, ef.title || '', ef.description || '', contributorsArr, track.version);
      if (ef.genre) {
        await setGenre(track.id, ef.genre || '');
      }
      if (ef.tags) {
        const tags = (ef.tags || '').split(',').map(t => t.trim()).filter(Boolean).map(t => t as string);
        await Promise.all(tags.map(t => addTag(track.id, t)));
      }
      setEditMode((prev) => ({ ...prev, [track.id.toString()]: false }));
      await fetchTracks();
      showMessage('Track updated!', 'success');
    } catch (e) {
      setActionError((prev) => ({ ...prev, [track.id.toString()]: 'Failed to update track.' }));
      showMessage('Failed to update track.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [track.id.toString()]: false }));
    }
  };

  const handleEditCancel = (trackId: bigint) => {
    setEditMode((prev) => ({ ...prev, [trackId.toString()]: false }));
  };

  const handleDownload = async (trackId: bigint, title: string) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      const file = await getTrackFileDownload(trackId);
      if (file && file.length > 0 && typeof file[0] === 'object' && 'data' in file[0]) {
        const trackFile = file[0] as { data: number[]; content_type?: string; filename?: string };
        const blob = new Blob([new Uint8Array(trackFile.data)], { type: trackFile.content_type || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = trackFile.filename || `${title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showMessage('Download started.', 'info');
      } else {
        setActionError((prev) => ({ ...prev, [trackId.toString()]: 'No file found for this track.' }));
        showMessage('No file found for this track.', 'warning');
      }
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to download file.' }));
      showMessage('Failed to download file.', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleOpenReport = (trackId: string | bigint) => {
    setReportTrackId(trackId.toString());
    setReportOpen(true);
    setReportError('');
  };

  const handleCloseReport = () => {
    setReportOpen(false);
    setReportTrackId(null);
    setReportError('');
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    setReportError('');
    try {
      if (!reportTrackId) throw new Error('No track selected for report.');
      await reportContent({ Track: null }, reportTrackId, reason, details);
      setReportOpen(false);
      setReportTrackId(null);
      showMessage('Report submitted. Thank you!', 'success');
    } catch (e) {
      setReportError('Failed to submit report.');
      showMessage('Failed to submit report.', 'error');
    }
  };

  const fetchLicense = async (trackId: bigint) => {
    setLicenseLoading(prev => ({ ...prev, [trackId.toString()]: true }));
    try {
      const lic = await getTrackLicense(trackId);
      setLicense(prev => ({ ...prev, [trackId.toString()]: lic && lic[0] ? lic[0] : null }));
      if (lic && lic[0]) {
        setLicenseFields(prev => ({ ...prev, [trackId.toString()]: {
          type: lic[0].license_type,
          terms: lic[0].terms && lic[0].terms[0] ? lic[0].terms[0] : '',
          contract: lic[0].contract_text && lic[0].contract_text[0] ? lic[0].contract_text[0] : '',
        }}));
      }
    } catch {
      setLicenseError(prev => ({ ...prev, [trackId.toString()]: 'Failed to load license.' }));
    } finally {
      setLicenseLoading(prev => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleLicenseEdit = (trackId: bigint) => {
    setLicenseEdit(prev => ({ ...prev, [trackId.toString()]: true }));
    if (!license[trackId.toString()]) fetchLicense(trackId);
  };

  const handleLicenseCancel = (trackId: bigint) => {
    setLicenseEdit(prev => ({ ...prev, [trackId.toString()]: false }));
  };

  const handleLicenseFieldChange = (trackId: bigint, field: string, value: any) => {
    setLicenseFields(prev => ({
      ...prev,
      [trackId.toString()]: {
        ...prev[trackId.toString()],
        [field]: value
      }
    }));
  };

  const handleLicenseSave = async (trackId: bigint) => {
    setLicenseLoading(prev => ({ ...prev, [trackId.toString()]: true }));
    setLicenseError(prev => ({ ...prev, [trackId.toString()]: null }));
    try {
      const fields = licenseFields[trackId.toString()] || {};
      await setTrackLicense(
        trackId,
        fields.type ?? { AllRightsReserved: null },
        fields.terms ?? '',
        fields.contract ?? ''
      );
      setLicenseEdit(prev => ({ ...prev, [trackId.toString()]: false }));
      fetchLicense(trackId);
    } catch {
      setLicenseError(prev => ({ ...prev, [trackId.toString()]: 'Failed to save license.' }));
    } finally {
      setLicenseLoading(prev => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleToggleVersions = async (trackId: bigint) => {
    setVersionOpen(prev => ({ ...prev, [trackId.toString()]: !prev[trackId.toString()] }));
    if (!versions[trackId.toString()]) {
      setVersionLoading(prev => ({ ...prev, [trackId.toString()]: true }));
      try {
        const v = await getTrackVersions(trackId);
        setVersions(prev => ({ ...prev, [trackId.toString()]: v }));
      } catch {
        setVersionError(prev => ({ ...prev, [trackId.toString()]: 'Failed to load versions.' }));
      } finally {
        setVersionLoading(prev => ({ ...prev, [trackId.toString()]: false }));
      }
    }
  };

  const handleCompare = async (trackId: bigint) => {
    const a = Number(compareA[trackId.toString()]);
    const b = Number(compareB[trackId.toString()]);
    if (!a || !b || a === b) return;
    setVersionLoading(prev => ({ ...prev, [trackId.toString()]: true }));
    try {
      const cmp = await compareVersions(trackId, a, b);
      setComparison(prev => ({ ...prev, [trackId.toString()]: cmp ?? null }));
    } catch {
      setVersionError(prev => ({ ...prev, [trackId.toString()]: 'Failed to compare versions.' }));
    } finally {
      setVersionLoading(prev => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleRevert = async (trackId: bigint, version: number) => {
    setRevertLoading(prev => ({ ...prev, [trackId.toString()]: true }));
    try {
      await revertToVersion(trackId, version);
      setVersionError(prev => ({ ...prev, [trackId.toString()]: null }));
      // Refresh versions and track list
      const v = await getTrackVersions(trackId);
      setVersions(prev => ({ ...prev, [trackId.toString()]: v }));
      await fetchTracks();
    } catch {
      setVersionError(prev => ({ ...prev, [trackId.toString()]: 'Failed to revert version.' }));
    } finally {
      setRevertLoading(prev => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleToggleWorkflow = async (trackId: bigint) => {
    setWorkflowOpen(prev => ({ ...prev, [trackId.toString()]: !prev[trackId.toString()] }));
    if (!workflowSteps[trackId.toString()]) {
      setWorkflowLoading(prev => ({ ...prev, [trackId.toString()]: true }));
      try {
        const steps = await getTrackWorkflowSteps(trackId);
        setWorkflowSteps(prev => ({ ...prev, [trackId.toString()]: steps }));
      } catch {
        setWorkflowError(prev => ({ ...prev, [trackId.toString()]: 'Failed to load workflow steps.' }));
      } finally {
        setWorkflowLoading(prev => ({ ...prev, [trackId.toString()]: false }));
      }
    }
  };

  const handleNewStepChange = (trackId: bigint, field: string, value: string) => {
    setNewStep(prev => ({
      ...prev,
      [trackId.toString()]: {
        ...prev[trackId.toString()],
        [field]: value
      }
    }));
  };

  const handleAddStep = async (trackId: bigint) => {
    setAddStepLoading(prev => ({ ...prev, [trackId.toString()]: true }));
    setAddStepError(prev => ({ ...prev, [trackId.toString()]: null }));
    try {
      const step = newStep[trackId.toString()] || { name: '', assignees: '', due: '', notes: '' };
      const assignees = step.assignees.split(',').map(id => id.trim()).filter(Boolean).map(id => BigInt(id));
      const dueDate = step.due ? BigInt(new Date(step.due).getTime() / 1000) : undefined;
      const created = await createWorkflowStep(trackId, step.name, assignees, dueDate, step.notes);
      if (!created) throw new Error('Failed to create step');
      const steps = await getTrackWorkflowSteps(trackId);
      setWorkflowSteps(prev => ({ ...prev, [trackId.toString()]: steps }));
      setNewStep(prev => ({ ...prev, [trackId.toString()]: { name: '', assignees: '', due: '', notes: '' } }));
    } catch {
      setAddStepError(prev => ({ ...prev, [trackId.toString()]: 'Failed to add step.' }));
    } finally {
      setAddStepLoading(prev => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleUpdateStepStatus = async (trackId: bigint, stepId: bigint, status: WorkflowStatus) => {
    setUpdateStepLoading(prev => ({ ...prev, [stepId.toString()]: true }));
    try {
      await updateWorkflowStepStatus(stepId, status);
      const steps = await getTrackWorkflowSteps(trackId);
      setWorkflowSteps(prev => ({ ...prev, [trackId.toString()]: steps }));
    } catch {
      setWorkflowError(prev => ({ ...prev, [trackId.toString()]: 'Failed to update step status.' }));
    } finally {
      setUpdateStepLoading(prev => ({ ...prev, [stepId.toString()]: false }));
    }
  };

  const handleTagSearch = async () => {
    if (tagSearch.trim()) {
      setLoading(true);
      setError(null);
      try {
        const data = await searchTracksByTag(tagSearch.trim());
        setTracks(data);
      } catch (e) {
        setError('Failed to search by tag.');
      } finally {
        setLoading(false);
      }
    } else {
      fetchTracks();
    }
  };

  const handleGenreSearch = async () => {
    if (genreSearch.trim()) {
      setLoading(true);
      setError(null);
      try {
        const data = await searchTracksByGenre(genreSearch.trim());
        setTracks(data);
      } catch (e) {
        setError('Failed to search by genre.');
      } finally {
        setLoading(false);
      }
    } else {
      fetchTracks();
    }
  };

  const handleFollow = async (trackId: bigint) => {
    try {
      await followTrack(trackId);
      await fetchFollowed();
      showMessage('Track followed!', 'success');
    } catch (e) {
      showMessage('Failed to follow track.', 'error');
    }
  };

  const handleUnfollow = async (trackId: bigint) => {
    try {
      await unfollowTrack(trackId);
      await fetchFollowed();
      showMessage('Track unfollowed.', 'info');
    } catch (e) {
      showMessage('Failed to unfollow track.', 'error');
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading tracks...</Typography></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Track List</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField label="Search by tag" value={tagSearch} onChange={e => setTagSearch(e.target.value)} size="small" />
        <Button variant="contained" onClick={handleTagSearch}>Search Tag</Button>
        <TextField label="Search by genre" value={genreSearch} onChange={e => setGenreSearch(e.target.value)} size="small" />
        <Button variant="contained" onClick={handleGenreSearch}>Search Genre</Button>
        {(tagSearch || genreSearch) && <Button onClick={() => { setTagSearch(''); setGenreSearch(''); fetchTracks(); }} color="secondary">Clear</Button>}
      </Stack>
      {tracks.length === 0 ? (
        <Typography>No tracks found.</Typography>
      ) : (
        <List>
          {tracks.map((track, idx) => {
            if (!track || typeof track !== 'object' || track.id === undefined || track.title === undefined || track.description === undefined) return null;
            const licObj = license && (
              // @ts-ignore
              license[track.id.toString()]
            ) ? (
              // @ts-ignore
              license[track.id.toString()]
            ) : undefined;
            // @ts-ignore
            const title = track.title;
            // @ts-ignore
            const description = track.description;
            return (
              <Card 
                key={idx}
                sx={{ 
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
                  mb: 2
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2, boxShadow: '0 2px 8px #42a5f5' }}>
                      <MusicNoteIcon />
                    </Avatar>
                    <Typography variant="h6" component="div" sx={{
                      background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      letterSpacing: 1,
                      textShadow: '0 2px 8px #42a5f5',
                    }}>
                      {/* @ts-ignore */}
                      {title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {/* @ts-ignore */}
                    {description}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                    // @ts-ignore
                    onClick={() => track.id && title && handleDownload(track.id, title)}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </List>
      )}
      <ReportModal
        open={reportOpen}
        onClose={handleCloseReport}
        onSubmit={handleSubmitReport}
        targetType={TRACK_TARGET_TYPE}
        targetId={reportTrackId || ''}
      />
      {reportError && <Alert severity="error">{reportError}</Alert>}
    </Box>
  );
};

export default TrackList; 