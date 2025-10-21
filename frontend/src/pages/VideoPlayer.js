import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import Hls from 'hls.js';
import { streamAPI, videoAPI } from '../services/api';

function VideoPlayer() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const [videoData, tokenData] = await Promise.all([
          videoAPI.getById(id),
          streamAPI.getToken(id)
        ]);
        setVideo(videoData.data.data.video);
        const streamUrl = \`\${process.env.REACT_APP_STREAM_URL}\${tokenData.data.data.streamUrl}\`;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(videoRef.current);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    };
    loadVideo();
  }, [id]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {video && <Typography variant="h4" gutterBottom>{video.title}</Typography>}
      <video ref={videoRef} controls style={{ width: '100%', maxHeight: '600px', backgroundColor: '#000' }} />
    </Container>
  );
}

export default VideoPlayer;
