import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import VideoCarousel from '../components/VideoCarousel';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [trendingVideos, setTrendingVideos] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_CONTENT_API_URL}/videos`);
        if (response.data && response.data.videos && Array.isArray(response.data.videos)) {
          const formattedVideos = response.data.videos.map(video => ({
            ...video,
            thumbnail: video.thumbnail 
              ? `${process.env.REACT_APP_CONTENT_API_URL}${video.thumbnail}`
              : '/placeholder.jpg',
          }));
          setTrendingVideos(formattedVideos);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching trending videos:', error);
        setError('Failed to load trending videos');
      } finally {
        setLoading(false);
      }
    };
    

    fetchTrendingVideos();
  }, []);

  const handleVideoClick = (videoId) => {
    if (isAuthenticated) {
      navigate(`/video/${videoId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <VideoCarousel />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
          Trending Now
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {trendingVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video._id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.3s ease-in-out'
                  }
                }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={video.thumbnail || '/placeholder.jpg'}
                    alt={video.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      fullWidth
                      onClick={() => handleVideoClick(video._id)}
                    >
                      {isAuthenticated ? 'Watch Now' : 'Login to Watch'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Home; 