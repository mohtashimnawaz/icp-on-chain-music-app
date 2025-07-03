import React, { useState } from 'react';
import { createTrack, uploadTrackFile, setGenre, addTag } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const MusicUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contributors, setContributors] = useState(''); // comma-separated user IDs
  const [tags, setTags] = useState(''); // comma-separated tags
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const { showMessage } = useSnackbar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title || !description || !contributors) {
      showMessage('Please fill all fields and select a file.', 'warning');
      return;
    }
    setLoading(true);
    try {
      // Parse contributors as array of BigInt
      const contributorIds = contributors.split(',').map(id => BigInt(id.trim())).filter(Boolean);
      // 1. Create the track
      const created = await createTrack(title, description, contributorIds);
      if (!created || !created[0] || !created[0].id) {
        showMessage('Track creation failed.', 'error');
        setLoading(false);
        return;
      }
      const trackId = created[0].id;
      // 2. Upload the file for the new track
      await uploadTrackFile(trackId.toString(), selectedFile);
      // 3. Set genre if provided
      if (genre.trim()) {
        await setGenre(trackId, genre.trim());
      }
      // 4. Add tags if provided
      if (tags.trim()) {
        const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
        for (const tag of tagArr) {
          await addTag(trackId, tag);
        }
      }
      showMessage('Track and file uploaded successfully!', 'success');
      setTitle('');
      setDescription('');
      setContributors('');
      setTags('');
      setGenre('');
      setSelectedFile(null);
    } catch (e) {
      showMessage('Upload failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Upload Music</Typography>
      <Stack spacing={2}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth />
        <TextField label="Contributors (comma-separated user IDs)" value={contributors} onChange={e => setContributors(e.target.value)} fullWidth />
        <TextField label="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} fullWidth />
        <TextField label="Genre" value={genre} onChange={e => setGenre(e.target.value)} fullWidth />
        <Button variant="contained" component="label" disabled={loading}>
          {selectedFile ? selectedFile.name : 'Select Audio File'}
          <input type="file" accept="audio/*" hidden onChange={handleFileChange} />
        </Button>
        <Button onClick={handleUpload} disabled={!selectedFile || loading} variant="contained" color="primary">
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Stack>
    </Box>
  );
};

export default MusicUpload; 