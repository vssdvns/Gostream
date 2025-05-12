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

// Helper function to format thumbnail URL
const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return '/placeholder.jpg';
  return thumbnail.startsWith('http')
    ? thumbnail
    : `${API_URL.replace('/api', '')}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
};

const Movies = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/videos?category=movie`);
        console.log('Movies response:', response.data);
        setMovies(response.data.videos);
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movieId) => {
    if (isAuthenticated) {
      navigate(`/video/${movieId}`);
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
        Movies
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie) => {
          const thumbnailUrl = getThumbnailUrl(movie.thumbnail);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
                onClick={() => handleMovieClick(movie._id)}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={thumbnailUrl}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {movie.releaseYear}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie._id);
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

export default Movies;
