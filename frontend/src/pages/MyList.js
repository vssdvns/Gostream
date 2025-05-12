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

const MyList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyList = async () => {
      if (!isAuthenticated || !user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${user._id}/list`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('My List response:', response.data); // Debug log
        setMyList(response.data.videos);
        setError(null);
      } catch (err) {
        console.error('Error fetching my list:', err);
        setError('Failed to load your list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyList();
  }, [isAuthenticated, user?._id]);

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6" color="text.secondary">
          Please log in to view your list
        </Typography>
      </Box>
    );
  }

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
        My List
      </Typography>
      {myList.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center">
          Your list is empty. Add some videos to get started!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {myList.map((video) => {
            const thumbnailUrl = video.thumbnail.startsWith('http') 
              ? video.thumbnail 
              : `http://localhost:5002${video.thumbnail.startsWith('/') ? '' : '/'}${video.thumbnail}`;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                <Card 
                  sx={{ 
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                  onClick={() => handleVideoClick(video._id)}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={thumbnailUrl}
                    alt={video.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.releaseYear}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVideoClick(video._id);
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
      )}
    </Box>
  );
};

export default MyList; 