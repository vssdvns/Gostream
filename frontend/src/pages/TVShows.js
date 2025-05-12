import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_CONTENT_API_URL || 'http://localhost:5002/api';

const TVShows = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [tvShows, setTVShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/videos?category=series`);
        console.log('TV Shows response:', response.data); // Debug log
        setTVShows(response.data.videos);
        setError(null);
      } catch (err) {
        console.error('Error fetching TV shows:', err);
        setError('Failed to load TV shows. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  const handleTVShowClick = (tvShowId) => {
    if (isAuthenticated) {
      navigate(`/video/${tvShowId}`);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        TV Shows
      </Typography>
      <Grid container spacing={3}>
        {tvShows.map((tvShow) => {
          const thumbnailUrl = tvShow.thumbnail.startsWith('http') 
            ? tvShow.thumbnail 
            : `http://localhost:5002${tvShow.thumbnail.startsWith('/') ? '' : '/'}${tvShow.thumbnail}`;
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tvShow._id}>
              <Card 
                sx={{ 
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
                onClick={() => handleTVShowClick(tvShow._id)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={thumbnailUrl}
                  alt={tvShow.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {tvShow.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tvShow.releaseYear}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTVShowClick(tvShow._id);
                    }}
                  >
                    Play
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TVShows; 