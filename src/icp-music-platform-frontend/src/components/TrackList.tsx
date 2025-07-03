import React, { useEffect, useState } from 'react';
import { listTracks, rateTrack, addComment, deleteTrack, updateTrack, getTrackFileDownload, reportContent, getTrackLicense, setTrackLicense, getTrackVersions, revertToVersion, compareVersions, getTrackWorkflowSteps, createWorkflowStep, updateWorkflowStepStatus, addTag, removeTag, setGenre, searchTracksByTag, searchTracksByGenre, followTrack, unfollowTrack, listFollowedTracks } from '../services/musicService';
import ReportModal from './ReportModal';
import type { ReportTargetType, LicenseType, TrackLicense, TrackVersion, VersionComparison, WorkflowStatus, WorkflowStep, WorkflowTemplate } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

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
      // For demo, use userId = 1n
      await rateTrack(trackId, 1n, rating[trackId.toString()] || 1);
      await fetchTracks();
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to rate track.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleComment = async (trackId: bigint) => {
    setActionLoading((prev) => ({ ...prev, [trackId.toString()]: true }));
    setActionError((prev) => ({ ...prev, [trackId.toString()]: null }));
    try {
      // For demo, use commenter = 1n
      await addComment(trackId, 1n, comment[trackId.toString()] || '');
      await fetchTracks();
      setComment((prev) => ({ ...prev, [trackId.toString()]: '' }));
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to add comment.' }));
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
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to delete track.' }));
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
    } catch (e) {
      setActionError((prev) => ({ ...prev, [track.id.toString()]: 'Failed to update track.' }));
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
      } else {
        setActionError((prev) => ({ ...prev, [trackId.toString()]: 'No file found for this track.' }));
      }
    } catch (e) {
      setActionError((prev) => ({ ...prev, [trackId.toString()]: 'Failed to download file.' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [trackId.toString()]: false }));
    }
  };

  const handleOpenReport = (trackId: string) => {
    setReportTrackId(trackId);
    setReportOpen(true);
    setReportError('');
  };

  const handleCloseReport = () => {
    setReportOpen(false);
    setReportTrackId(null);
    setReportError('');
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    if (!reportTrackId) return;
    try {
      await reportContent(TRACK_TARGET_TYPE, reportTrackId, reason, details);
      setReportOpen(false);
      setReportTrackId(null);
    } catch {
      setReportError('Failed to submit report.');
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
    await followTrack(trackId);
    fetchFollowed();
  };

  const handleUnfollow = async (trackId: bigint) => {
    await unfollowTrack(trackId);
    fetchFollowed();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading tracks...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Track List</h2>
      <div style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Search by tag" value={tagSearch} onChange={e => setTagSearch(e.target.value)} style={{ marginRight: 8 }} />
        <button onClick={handleTagSearch} style={{ marginRight: 16 }}>Search Tag</button>
        <input type="text" placeholder="Search by genre" value={genreSearch} onChange={e => setGenreSearch(e.target.value)} style={{ marginRight: 8 }} />
        <button onClick={handleGenreSearch}>Search Genre</button>
        {(tagSearch || genreSearch) && <button onClick={() => { setTagSearch(''); setGenreSearch(''); fetchTracks(); }} style={{ marginLeft: 16 }}>Clear</button>}
      </div>
      {tracks.length === 0 ? (
        <p>No tracks found.</p>
      ) : (
        <ul>
          {tracks.map((track, idx) => {
            const licObj = license && license[track.id.toString()] ? license[track.id.toString()] : undefined;
            return (
              <li key={idx} style={{ marginBottom: 24, borderBottom: '1px solid #444', paddingBottom: 16 }}>
                {editMode[track.id.toString()] ? (
                  <div>
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.title ?? ''}
                      onChange={e => handleEditChange(track.id, 'title', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.description ?? ''}
                      onChange={e => handleEditChange(track.id, 'description', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.contributors ?? ''}
                      onChange={e => handleEditChange(track.id, 'contributors', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.genre ?? track.genre ?? ''}
                      onChange={e => handleEditChange(track.id, 'genre', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                      placeholder="Genre"
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.tags ?? (Array.isArray(track.tags) ? track.tags.join(', ') : '')}
                      onChange={e => handleEditChange(track.id, 'tags', (e.target.value ?? '') + '')}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                      placeholder="Tags (comma-separated)"
                    />
                    <br />
                    <button onClick={() => handleEditSave(track)} disabled={actionLoading[track.id.toString()]}>Save</button>
                    <button onClick={() => handleEditCancel(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginLeft: 8 }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <strong>{track.title}</strong> <br />
                    <span>{track.description}</span> <br />
                    <span>Contributors: {track.contributors?.join(', ')}</span> <br />
                    <span>Genre: {track.genre ?? ''}</span> <br />
                    <span>Tags: {Array.isArray(track.tags) ? track.tags.join(', ') : ''}</span> <br />
                    <span>Play count: {track.play_count ?? 0}</span> <br />
                    <span>Average rating: {track.ratings && track.ratings.length > 0 ? (track.ratings.reduce((acc: number, r: any) => acc + r[1], 0) / track.ratings.length).toFixed(2) : 'N/A'}</span>
                    <div style={{ marginTop: 8 }}>
                      <label>Rate: </label>
                      <select
                        value={rating[track.id.toString()] || 1}
                        onChange={e => setRating(prev => ({ ...prev, [track.id.toString()]: Number(e.target.value) }))}
                        disabled={actionLoading[track.id.toString()]}
                      >
                        {[1, 2, 3, 4, 5].map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      <button onClick={() => handleRate(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginLeft: 8 }}>
                        {actionLoading[track.id.toString()] ? 'Rating...' : 'Rate'}
                      </button>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <label>Comment: </label>
                      <input
                        type="text"
                        value={comment[track.id.toString()] || ''}
                        onChange={e => setComment(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}
                        disabled={actionLoading[track.id.toString()]}
                        style={{ width: 200 }}
                      />
                      <button onClick={() => handleComment(track.id)} disabled={actionLoading[track.id.toString()] || !(comment[track.id.toString()] && comment[track.id.toString()].trim())} style={{ marginLeft: 8 }}>
                        {actionLoading[track.id.toString()] ? 'Commenting...' : 'Add Comment'}
                      </button>
                    </div>
                    <button onClick={() => handleEdit(track)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8, marginRight: 8 }}>Edit</button>
                    <button onClick={() => handleDelete(track.id)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8, marginRight: 8, color: 'red' }}>Delete</button>
                    <button onClick={() => handleDownload(track.id, track.title)} disabled={actionLoading[track.id.toString()]} style={{ marginTop: 8 }}>Download</button>
                    <button onClick={() => handleOpenReport(track.id.toString())} style={{ marginLeft: 8 }}>Report</button>
                    <div style={{ marginTop: 8 }}>
                      <strong>License:</strong>
                      {licenseLoading[track.id.toString()] ? (
                        <span>Loading license...</span>
                      ) : licenseEdit[track.id.toString()] ? (
                        <div style={{ marginTop: 4 }}>
                          <label>Type: </label>
                          <select
                            value={(() => {
                              const lf = licenseFields[track.id.toString()];
                              if (lf && lf.type) {
                                const keys = Object.keys(lf.type);
                                return keys.length > 0 ? keys[0] : 'AllRightsReserved';
                              }
                              return 'AllRightsReserved';
                            })()}
                            onChange={e => handleLicenseFieldChange(track.id, 'type', LICENSE_OPTIONS.find(opt => Object.keys(opt.value)[0] === e.target.value)?.value || { AllRightsReserved: null })}
                            style={{ marginRight: 8 }}
                          >
                            {LICENSE_OPTIONS.map(opt => (
                              <option key={Object.keys(opt.value)[0]} value={Object.keys(opt.value)[0]}>{opt.label}</option>
                            ))}
                          </select>
                          <br />
                          <label>Terms: </label>
                          <input
                            type="text"
                            value={licenseFields[track.id.toString()] && typeof licenseFields[track.id.toString()].terms === 'string' ? licenseFields[track.id.toString()].terms : ''}
                            onChange={e => handleLicenseFieldChange(track.id, 'terms', e.target.value)}
                            style={{ width: 200, marginRight: 8 }}
                          />
                          <br />
                          {licenseFields[track.id.toString()] !== undefined && (
                            <input
                              type="text"
                              value={licenseFields[track.id.toString()]?.contract ?? ''}
                              onChange={e => handleLicenseFieldChange(track.id, 'contract', (e.target.value ?? '') + '')}
                              style={{ width: 200, marginRight: 8 }}
                            />
                          )}
                          <br />
                          <button onClick={() => handleLicenseSave(track.id)} disabled={licenseLoading[track.id.toString()]}>Save</button>
                          <button onClick={() => handleLicenseCancel(track.id)} style={{ marginLeft: 8 }}>Cancel</button>
                          {licenseError[track.id.toString()] && <div style={{ color: 'red' }}>{licenseError[track.id.toString()]}</div>}
                        </div>
                      ) : licObj ? (
                        <div style={{ marginTop: 4 }}>
                          <span>Type: {(licObj.license_type && typeof licObj.license_type === 'object') ? Object.keys(licObj.license_type as object)[0] : ''}</span><br />
                          <span>Terms: {(Array.isArray(licObj.terms) && licObj.terms.length > 0) ? licObj.terms[0] : ''}</span><br />
                          <span>Contract: {(Array.isArray(licObj.contract_text) && licObj.contract_text.length > 0) ? licObj.contract_text[0] : ''}</span><br />
                          <button onClick={() => handleLicenseEdit(track.id)} style={{ marginTop: 4 }}>Edit License</button>
                        </div>
                      ) : (
                        <div style={{ marginTop: 4 }}>
                          <span>No license set.</span>
                          <button onClick={() => handleLicenseEdit(track.id)} style={{ marginLeft: 8 }}>Set License</button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleToggleVersions(track.id)} style={{ marginTop: 8 }}>
                      {versionOpen[track.id.toString()] ? 'Hide Versions' : 'Show Versions'}
                    </button>
                    {versionOpen[track.id.toString()] && (
                      <div style={{ marginTop: 8, background: '#222', padding: 12, borderRadius: 6 }}>
                        {versionLoading[track.id.toString()] ? (
                          <span>Loading versions...</span>
                        ) : versions[track.id.toString()] && versions[track.id.toString()].length > 0 ? (
                          <>
                            <strong>Version History:</strong>
                            <ul>
                              {versions[track.id.toString()].map((v, i) => (
                                <li key={v.version} style={{ marginBottom: 4 }}>
                                  <b>v{v.version}</b> - {v.title} ({new Date(Number(v.changed_at) * 1000).toLocaleString()})
                                  {v.change_description && <span> - {v.change_description[0]}</span>}
                                  <button onClick={() => handleRevert(track.id, v.version)} disabled={revertLoading[track.id.toString()]} style={{ marginLeft: 8 }}>
                                    {revertLoading[track.id.toString()] ? 'Reverting...' : 'Revert to this version'}
                                  </button>
                                </li>
                              ))}
                            </ul>
                            <div style={{ marginTop: 8 }}>
                              <strong>Compare Versions:</strong><br />
                              <label>Version A: </label>
                              <select value={compareA[track.id.toString()] || ''} onChange={e => setCompareA(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}>
                                <option value="">-- Select --</option>
                                {versions[track.id.toString()].map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
                              </select>
                              <label style={{ marginLeft: 8 }}>Version B: </label>
                              <select value={compareB[track.id.toString()] || ''} onChange={e => setCompareB(prev => ({ ...prev, [track.id.toString()]: e.target.value }))}>
                                <option value="">-- Select --</option>
                                {versions[track.id.toString()].map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
                              </select>
                              <button onClick={() => handleCompare(track.id)} style={{ marginLeft: 8 }}>Compare</button>
                            </div>
                            {track && track.id && comparison[track.id.toString()] && (
                              <div style={{ marginTop: 8, background: '#333', padding: 8, borderRadius: 4 }}>
                                <strong>Comparison Result:</strong><br />
                                <span>Title changed: {comparison[track.id.toString()]?.title_changed ? 'Yes' : 'No'}</span><br />
                                {comparison[track.id.toString()]?.title_diff?.[0] && (
                                  <span>Title diff: {comparison[track.id.toString()]?.title_diff?.[0]}</span>
                                )}<br />
                                <span>Description changed: {comparison[track.id.toString()]?.description_changed ? 'Yes' : 'No'}</span><br />
                                {comparison[track.id.toString()]?.description_diff?.[0] && (
                                  <span>Description diff: {comparison[track.id.toString()]?.description_diff?.[0]}</span>
                                )}<br />
                                <span>Contributors changed: {comparison[track.id.toString()]?.contributors_changed ? 'Yes' : 'No'}</span><br />
                                {comparison[track.id.toString()]?.contributors_diff?.[0] && (
                                  <span>Contributors diff: {comparison[track.id.toString()]?.contributors_diff?.[0]}</span>
                                )}<br />
                              </div>
                            )}
                          </>
                        ) : <span>No version history.</span>}
                        {versionError[track.id.toString()] && <div style={{ color: 'red' }}>{versionError[track.id.toString()]}</div>}
                      </div>
                    )}
                    <button onClick={() => handleToggleWorkflow(track.id)} style={{ marginTop: 8 }}>
                      {workflowOpen[track.id.toString()] ? 'Hide Workflow' : 'Show Workflow'}
                    </button>
                    {workflowOpen[track.id.toString()] && (
                      <div style={{ marginTop: 8, background: '#1a1a1a', padding: 12, borderRadius: 6 }}>
                        {workflowLoading[track.id.toString()] ? (
                          <span>Loading workflow steps...</span>
                        ) : workflowSteps[track.id.toString()] && workflowSteps[track.id.toString()].length > 0 ? (
                          <>
                            <strong>Workflow Steps:</strong>
                            <ul>
                              {workflowSteps[track.id.toString()]?.map((step, i) => (
                                <li key={step.id?.toString() ?? i} style={{ marginBottom: 8 }}>
                                  <b>{step.step_name ?? ''}</b> | Status: {Object.keys(step.status ?? {})[0] ?? ''} | Assigned to: {((step.assigned_to as unknown as bigint[]) ?? []).map((a: bigint) => a.toString()).join(', ')}
                                  {step.due_date && step.due_date[0] && (
                                    <> | Due: {new Date(Number(step.due_date[0]) * 1000).toLocaleDateString()}</>
                                  )}
                                  {step.notes && step.notes[0] && (
                                    <> | Notes: {step.notes[0]}</>
                                  )}
                                  {Object.keys(step.status ?? {})[0] !== 'Completed' && (
                                    <button onClick={() => handleUpdateStepStatus(track.id, step.id, { Completed: null } as unknown as WorkflowStatus)} disabled={updateStepLoading[step.id?.toString() ?? '']} style={{ marginLeft: 8 }}>
                                      {updateStepLoading[step.id?.toString() ?? ''] ? 'Marking...' : 'Mark Completed'}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : <span>No workflow steps.</span>}
                        <div style={{ marginTop: 12, borderTop: '1px solid #333', paddingTop: 8 }}>
                          <strong>Add Workflow Step:</strong><br />
                          <input
                            type="text"
                            placeholder="Step name"
                            value={newStep[track.id.toString()]?.name || ''}
                            onChange={e => handleNewStepChange(track.id, 'name', e.target.value)}
                            style={{ marginRight: 8 }}
                          />
                          <input
                            type="text"
                            placeholder="Assignees (comma-separated IDs)"
                            value={newStep[track.id.toString()]?.assignees || ''}
                            onChange={e => handleNewStepChange(track.id, 'assignees', e.target.value)}
                            style={{ marginRight: 8, width: 180 }}
                          />
                          <input
                            type="date"
                            value={newStep[track.id.toString()]?.due || ''}
                            onChange={e => handleNewStepChange(track.id, 'due', e.target.value)}
                            style={{ marginRight: 8 }}
                          />
                          <input
                            type="text"
                            placeholder="Notes"
                            value={newStep[track.id.toString()]?.notes || ''}
                            onChange={e => handleNewStepChange(track.id, 'notes', e.target.value)}
                            style={{ marginRight: 8, width: 180 }}
                          />
                          <button onClick={() => handleAddStep(track.id)} disabled={addStepLoading[track.id.toString()] || !(newStep[track.id.toString()]?.name)}>
                            {addStepLoading[track.id.toString()] ? 'Adding...' : 'Add Step'}
                          </button>
                          {addStepError[track.id.toString()] && <div style={{ color: 'red' }}>{addStepError[track.id.toString()]}</div>}
                        </div>
                        {workflowError[track.id.toString()] && <div style={{ color: 'red' }}>{workflowError[track.id.toString()]}</div>}
                      </div>
                    )}
                    {followed.has(track?.id?.toString?.() ?? '') ? (
                      <button onClick={() => handleUnfollow(track.id)} disabled={!!actionLoading?.[track?.id?.toString?.() ?? '']}>Unfollow</button>
                    ) : (
                      <button onClick={() => handleFollow(track.id)} disabled={!!actionLoading?.[track?.id?.toString?.() ?? '']}>Follow</button>
                    )}
                  </>
                )}
                {actionError[track.id.toString()] && <div style={{ color: 'red', marginTop: 4 }}>{actionError[track.id.toString()]}</div>}
                {track.comments && track.comments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Comments:</strong>
                    <ul>
                      {track.comments.map((c: any, i: number) => (
                        <li key={i}>{c.text} (by {c.commenter})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ReportModal
        open={reportOpen}
        onClose={handleCloseReport}
        onSubmit={handleSubmitReport}
        targetType={TRACK_TARGET_TYPE}
        targetId={reportTrackId || ''}
      />
      {reportError && <div style={{ color: 'red' }}>{reportError}</div>}
    </div>
  );
};

export default TrackList; 