import React, { useState } from 'react';
import { Container, Button, TextField, Box, LinearProgress, Typography } from '@mui/material';
import { videoAPI } from '../services/api';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);

    setUploading(true);
    try {
      await videoAPI.upload(formData, setProgress);
      alert('Upload successful!');
      setFile(null);
      setTitle('');
      setProgress(0);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Video</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Select Video
          <input type="file" hidden accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
        </Button>
        {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
        {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={!file || uploading}>
          Upload
        </Button>
      </Box>
    </Container>
  );
}

export default Upload;
