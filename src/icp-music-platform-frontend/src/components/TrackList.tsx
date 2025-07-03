import React, { useEffect, useState } from 'react';
import { listTracks, rateTrack, addComment, deleteTrack, updateTrack, getTrackFileDownload, reportContent, getTrackLicense, setTrackLicense, getTrackVersions, revertToVersion, compareVersions } from '../services/musicService';
import ReportModal from './ReportModal';
import type { ReportTargetType, LicenseType, TrackLicense, TrackVersion, VersionComparison } from '../../../declarations/icp-music-platform-backend/icp-music-platform-backend.did';

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
  const [editFields, setEditFields] = useState<{ [id: string]: { title: string; description: string; contributors: string } }>({});
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

  useEffect(() => {
    fetchTracks();
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
      contributors: track.contributors?.join(', ') || ''
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
      const contributorsArr = editFields[track.id.toString()].contributors.split(',').map((id: string) => BigInt(id.trim())).filter(Boolean);
      await updateTrack(track.id, editFields[track.id.toString()].title, editFields[track.id.toString()].description, contributorsArr, track.version);
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
      const fields = licenseFields[trackId.toString()];
      await setTrackLicense(trackId, fields.type, fields.terms, fields.contract);
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading tracks...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Track List</h2>
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
                      value={editFields[track.id.toString()]?.title || ''}
                      onChange={e => handleEditChange(track.id, 'title', e.target.value)}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.description || ''}
                      onChange={e => handleEditChange(track.id, 'description', e.target.value)}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
                    />
                    <br />
                    <input
                      type="text"
                      value={editFields[track.id.toString()]?.contributors || ''}
                      onChange={e => handleEditChange(track.id, 'contributors', e.target.value)}
                      disabled={actionLoading[track.id.toString()]}
                      style={{ marginBottom: 4 }}
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
                          <label>Contract: </label>
                          <input
                            type="text"
                            value={licenseFields[track.id.toString()] && typeof licenseFields[track.id.toString()].contract === 'string' ? licenseFields[track.id.toString()].contract : ''}
                            onChange={e => handleLicenseFieldChange(track.id, 'contract', e.target.value)}
                            style={{ width: 200, marginRight: 8 }}
                          />
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