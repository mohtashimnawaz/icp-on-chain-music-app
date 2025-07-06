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

const TRACK_TARGET_TYPE: ReportTargetType = { Track: null };

const LICENSE_OPTIONS: { label: string; value: LicenseType }[] = [
  { label: 'All Rights Reserved', value: { AllRightsReserved: null } },
  { label: 'Creative Commons', value: { CreativeCommons: null } },
  { label: 'Custom', value: { Custom: null } },
];

const TrackList: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
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
      setTracks(data);
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
    if (!reportTrackId || typeof reportTrackId !== 'string' || isNaN(Number(reportTrackId))) return;
    setReportError('');
    try {
      await reportContent({ Track: BigInt(reportTrackId) }, reason, details);
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
            const licObj = license && license[track.id.toString()] ? license[track.id.toString()] : undefined;
            return (
              <Paper key={idx} sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: '#232323' }} elevation={2}>
                {editMode[track.id.toString()] ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Title"
                      value={editFields[track.id.toString()]?.title ?? ''}
                      onChange={e => handleEditChange(track.id, 'title', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                    />
                    <TextField
                      label="Description"
                      value={editFields[track.id.toString()]?.description ?? ''}
                      onChange={e => handleEditChange(track.id, 'description', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                    />
                    <TextField
                      label="Contributors (comma-separated IDs)"
                      value={editFields[track.id.toString()]?.contributors ?? ''}
                      onChange={e => handleEditChange(track.id, 'contributors', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                    />
                    <TextField
                      label="Genre"
                      value={editFields[track.id.toString()]?.genre ?? track.genre ?? ''}
                      onChange={e => handleEditChange(track.id, 'genre', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                    />
                    <TextField
                      label="Tags (comma-separated)"
                      value={editFields[track.id.toString()]?.tags ?? (Array.isArray(track.tags) ? track.tags.join(', ') : '')}
                      onChange={e => handleEditChange(track.id, 'tags', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" onClick={() => handleEditSave(track)} disabled={actionLoading[track.id.toString()]}>Save</Button>
                      <Button onClick={() => handleEditCancel(track.id)} disabled={actionLoading[track.id.toString()]}>Cancel</Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Box>
                    <Typography variant="h6">{track.title}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{track.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Contributors: ${track.contributors?.join(', ')}`} size="small" />
                      <Chip label={`Genre: ${track.genre ?? ''}`} size="small" />
                      <Chip label={`Tags: ${Array.isArray(track.tags) ? track.tags.join(', ') : ''}`} size="small" />
                      <Chip label={`Play count: ${track.play_count ?? 0}`} size="small" />
                      <Chip label={`Avg rating: ${track.ratings && track.ratings.length > 0 ? (track.ratings.reduce((acc: number, r: any) => acc + r[1], 0) / track.ratings.length).toFixed(2) : 'N/A'}`} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Typography>Rate:</Typography>
                      <Select
                        value={rating[track.id.toString()] || 1}
                        onChange={e => setRating(prev => ({ ...prev, [track.id.toString()]: Number(e.target.value) }))}
                        size="small"
                        disabled={actionLoading[track.id.toString()]}
                        sx={{ minWidth: 80 }}
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <MenuItem key={val} value={val}>{val}</MenuItem>
                        ))}
                      </Select>
                      <Button onClick={() => handleRate(track.id)} disabled={actionLoading[track.id.toString()]} variant="outlined">
                        {actionLoading[track.id.toString()] ? <CircularProgress size={18} /> : 'Rate'}
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <TextField
                        label="Comment"
                        value={comment[track.id.toString()] || ''}
                        onChange={e => setComment(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}
                        size="small"
                        disabled={actionLoading[track.id.toString()]}
                        sx={{ width: 200 }}
                      />
                      <Button onClick={() => handleComment(track.id)} disabled={actionLoading[track.id.toString()] || !(comment[track.id.toString()] && comment[track.id.toString()].trim())} variant="outlined">
                        {actionLoading[track.id.toString()] ? <CircularProgress size={18} /> : 'Add Comment'}
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Button onClick={() => handleEdit(track)} disabled={actionLoading[track.id.toString()]} variant="outlined">Edit</Button>
                      <Button onClick={() => handleDelete(track.id)} disabled={actionLoading[track.id.toString()]} color="error" variant="outlined">Delete</Button>
                      <Button onClick={() => handleDownload(track.id, track.title)} disabled={actionLoading[track.id.toString()]} variant="outlined">Download</Button>
                      <Button onClick={() => handleOpenReport(track.id)} variant="outlined">Report</Button>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Typography>License:</Typography>
                      {licenseLoading[track.id.toString()] ? (
                        <CircularProgress size={18} />
                      ) : licenseEdit[track.id.toString()] ? (
                        <Stack spacing={1}>
                          <Typography>Type:</Typography>
                          <Select
                            value={(() => {
                              const lf = licenseFields[track.id.toString()];
                              if (lf && lf.type) {
                                const keys = Object.keys(lf.type);
                                return keys.length > 0 ? keys[0] : 'AllRightsReserved';
                              }
                              return 'AllRightsReserved';
                            })()}
                            onChange={e => handleLicenseFieldChange(track.id, 'type', LICENSE_OPTIONS.find(opt => Object.keys(opt.value)[0] === e.target.value)?.value || { AllRightsReserved: null })}
                            size="small"
                          >
                            {LICENSE_OPTIONS.map(opt => (
                              <MenuItem key={Object.keys(opt.value)[0]} value={Object.keys(opt.value)[0]}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                          <TextField
                            label="Terms"
                            value={licenseFields[track.id.toString()]?.terms ?? ''}
                            onChange={e => handleLicenseFieldChange(track.id, 'terms', e.target.value)}
                            size="small"
                          />
                          <TextField
                            label="Contract"
                            value={licenseFields[track.id.toString()]?.contract ?? ''}
                            onChange={e => handleLicenseFieldChange(track.id, 'contract', (e.target.value ?? '') + '')}
                            size="small"
                          />
                          <Stack direction="row" spacing={2}>
                            <Button onClick={() => handleLicenseSave(track.id)} disabled={licenseLoading[track.id.toString()]}>Save</Button>
                            <Button onClick={() => handleLicenseCancel(track.id)}>Cancel</Button>
                          </Stack>
                          {licenseError[track.id.toString()] && <Alert severity="error">{licenseError[track.id.toString()]}</Alert>}
                        </Stack>
                      ) : licObj ? (
                        <Stack spacing={1}>
                          <Typography>Type:</Typography>
                          <Chip label={(licObj.license_type && typeof licObj.license_type === 'object') ? Object.keys(licObj.license_type as object)[0] : ''} size="small" />
                          <Chip label={(Array.isArray(licObj.terms) && licObj.terms.length > 0) ? licObj.terms[0] : ''} size="small" />
                          <Chip label={(Array.isArray(licObj.contract_text) && licObj.contract_text.length > 0) ? licObj.contract_text[0] : ''} size="small" />
                          <Button onClick={() => handleLicenseEdit(track.id)}>Edit License</Button>
                        </Stack>
                      ) : (
                        <Button onClick={() => handleLicenseEdit(track.id)}>Set License</Button>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Button onClick={() => handleToggleVersions(track.id)} variant="outlined">
                        {versionOpen[track.id.toString()] ? 'Hide Versions' : 'Show Versions'}
                      </Button>
                    </Stack>
                    {versionOpen[track.id.toString()] && (
                      <Box>
                        {versionLoading[track.id.toString()] ? (
                          <CircularProgress />
                        ) : versions[track.id.toString()] && versions[track.id.toString()].length > 0 ? (
                          <>
                            <Typography variant="h6">Version History:</Typography>
                            <List>
                              {versions[track.id.toString()].map((v, i) => (
                                <ListItem key={v.version}>
                                  <Typography variant="body2">
                                    <b>v{v.version}</b> - {v.title} ({new Date(Number(v.changed_at) * 1000).toLocaleString()})
                                    {v.change_description && <span> - {v.change_description[0]}</span>}
                                    <Button onClick={() => handleRevert(track.id, v.version)} disabled={revertLoading[track.id.toString()]}>
                                      {revertLoading[track.id.toString()] ? 'Reverting...' : 'Revert to this version'}
                                    </Button>
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                              <Typography>Compare Versions:</Typography>
                              <Select
                                value={compareA[track.id.toString()] || ''}
                                onChange={e => setCompareA(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}
                                size="small"
                              >
                                <MenuItem value="">-- Select --</MenuItem>
                                {versions[track.id.toString()].map(v => (
                                  <MenuItem key={v.version} value={v.version}>{v.version}</MenuItem>
                                ))}
                              </Select>
                              <Select
                                value={compareB[track.id.toString()] || ''}
                                onChange={e => setCompareB(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}
                                size="small"
                              >
                                <MenuItem value="">-- Select --</MenuItem>
                                {versions[track.id.toString()].map(v => (
                                  <MenuItem key={v.version} value={v.version}>{v.version}</MenuItem>
                                ))}
                              </Select>
                              <Button onClick={() => handleCompare(track.id)}>Compare</Button>
                            </Stack>
                            {track && track.id && comparison[track.id.toString()] && (
                              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#333' }}>
                                <Typography variant="h6">Comparison Result:</Typography>
                                <Typography variant="body2">Title changed: {comparison[track.id.toString()]?.title_changed ? 'Yes' : 'No'}</Typography>
                                {comparison[track.id.toString()]?.title_diff?.[0] && (
                                  <Typography variant="body2">Title diff: {comparison[track.id.toString()]?.title_diff?.[0]}</Typography>
                                )}
                                <Typography variant="body2">Description changed: {comparison[track.id.toString()]?.description_changed ? 'Yes' : 'No'}</Typography>
                                {comparison[track.id.toString()]?.description_diff?.[0] && (
                                  <Typography variant="body2">Description diff: {comparison[track.id.toString()]?.description_diff?.[0]}</Typography>
                                )}
                                <Typography variant="body2">Contributors changed: {comparison[track.id.toString()]?.contributors_changed ? 'Yes' : 'No'}</Typography>
                                {comparison[track.id.toString()]?.contributors_diff?.[0] && (
                                  <Typography variant="body2">Contributors diff: {comparison[track.id.toString()]?.contributors_diff?.[0]}</Typography>
                                )}
                              </Box>
                            )}
                          </>
                        ) : <Typography>No version history.</Typography>}
                        {versionError[track.id.toString()] && <Alert severity="error">{versionError[track.id.toString()]}</Alert>}
                      </Box>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                      <Button onClick={() => handleToggleWorkflow(track.id)} variant="outlined">
                        {workflowOpen[track.id.toString()] ? 'Hide Workflow' : 'Show Workflow'}
                      </Button>
                    </Stack>
                    {workflowOpen[track.id.toString()] && (
                      <Box>
                        {workflowLoading[track.id.toString()] ? (
                          <CircularProgress />
                        ) : workflowSteps[track.id.toString()] && workflowSteps[track.id.toString()].length > 0 ? (
                          <>
                            <Typography variant="h6">Workflow Steps:</Typography>
                            <List>
                              {workflowSteps[track.id.toString()].map((step, i) => (
                                <ListItem key={step.id?.toString() ?? i}>
                                  <Typography variant="body2">
                                    <b>{step.step_name ?? ''}</b> | Status: {Object.keys(step.status ?? {})[0] ?? ''} | Assigned to: {((step.assigned_to as unknown as bigint[]) ?? []).map((a: bigint) => a.toString()).join(', ')}
                                    {step.due_date && step.due_date[0] && (
                                      <> | Due: {new Date(Number(step.due_date[0]) * 1000).toLocaleDateString()}</>
                                    )}
                                    {step.notes && step.notes[0] && (
                                      <> | Notes: {step.notes[0]}</>
                                    )}
                                    {Object.keys(step.status ?? {})[0] !== 'Completed' && step.id !== undefined && (
                                      <Button onClick={() => handleUpdateStepStatus(track.id, step.id as bigint, { Completed: null } as unknown as WorkflowStatus)} disabled={updateStepLoading[step.id?.toString() ?? '']}>
                                        {updateStepLoading[step.id?.toString() ?? ''] ? 'Marking...' : 'Mark Completed'}
                                      </Button>
                                    )}
                                  </Typography>
                                </ListItem>
                              ))}
                            </List>
                          </>
                        ) : <Typography>No workflow steps.</Typography>}
                        <Stack direction="row" spacing={2} sx={{ mt: 2, borderTop: '1px solid #333', pt: 2 }}>
                          <Typography>Add Workflow Step:</Typography>
                          <TextField
                            label="Step name"
                            value={newStep[track.id.toString()]?.name || ''}
                            onChange={e => handleNewStepChange(track.id, 'name', e.target.value)}
                            size="small"
                          />
                          <TextField
                            label="Assignees (comma-separated IDs)"
                            value={newStep[track.id.toString()]?.assignees || ''}
                            onChange={e => handleNewStepChange(track.id, 'assignees', e.target.value)}
                            size="small"
                          />
                          <TextField
                            label="Due date"
                            type="date"
                            value={newStep[track.id.toString()]?.due || ''}
                            onChange={e => handleNewStepChange(track.id, 'due', e.target.value)}
                            size="small"
                          />
                          <TextField
                            label="Notes"
                            value={newStep[track.id.toString()]?.notes || ''}
                            onChange={e => handleNewStepChange(track.id, 'notes', e.target.value)}
                            size="small"
                          />
                          <Button onClick={() => handleAddStep(track.id)} disabled={addStepLoading[track.id.toString()] || !(newStep[track.id.toString()]?.name)}>
                            {addStepLoading[track.id.toString()] ? <CircularProgress size={18} /> : 'Add Step'}
                          </Button>
                        </Stack>
                        {addStepError[track.id.toString()] && <Alert severity="error">{addStepError[track.id.toString()]}</Alert>}
                      </Box>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      {followed.has(track?.id?.toString?.() ?? '') ? (
                        <Button onClick={() => handleUnfollow(track.id)} disabled={!!actionLoading?.[track?.id?.toString?.() ?? '']}>Unfollow</Button>
                      ) : (
                        <Button onClick={() => handleFollow(track.id)} disabled={!!actionLoading?.[track?.id?.toString?.() ?? '']}>Follow</Button>
                      )}
                    </Stack>
                  </Box>
                )}
                {actionError[track.id.toString()] && <Alert severity="error" sx={{ mt: 2 }}>{actionError[track.id.toString()]}</Alert>}
                {track.comments && track.comments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Comments:</Typography>
                    <List>
                      {track.comments.map((c: any, i: number) => (
                        <ListItem key={i}>
                          <Typography variant="body2">{c.text} (by {c.commenter})</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
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