import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';

const New = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/videos?sort=-createdAt');
        setVideos(response.data.videos);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching new videos:', error);
        setError('Failed to load new videos. Please try again later.');
        setLoading(false);
      }
    };

    fetchNewVideos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>New & Popular</Typography>
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
            {/* Add video card component here */}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default New; 