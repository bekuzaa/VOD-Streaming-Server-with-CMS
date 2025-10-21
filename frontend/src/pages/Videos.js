import React, { useEffect, useState } from 'react';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';
import { videoAPI } from '../services/api';

function Videos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      setVideos(response.data.data.videos);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await videoAPI.delete(id);
        loadVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <h2>Videos</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video._id}>
              <TableCell>{video.title}</TableCell>
              <TableCell><Chip label={video.status} color={video.status === 'ready' ? 'success' : 'warning'} /></TableCell>
              <TableCell>{Math.round(video.duration / 60)} min</TableCell>
              <TableCell>{video.views}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleDelete(video._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default Videos;
