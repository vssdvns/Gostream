import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import axios from 'axios';

const VideoCarousel = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos...');
        const response = await axios.get(`${process.env.REACT_APP_CONTENT_API_URL}/videos`);
        console.log('API Response:', response.data);
        
        if (response.data && response.data.videos && Array.isArray(response.data.videos)) {
          const formattedVideos = response.data.videos.map(video => ({
            ...video,
            thumbnail: video.thumbnail 
              ? `${process.env.REACT_APP_CONTENT_API_URL}${video.thumbnail}`
              : null
          }));
          
          setVideos(formattedVideos);
          console.log('Formatted videos:', formattedVideos);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === videos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const handleVideoClick = (videoId) => {
    if (isAuthenticated) {
      navigate(`/video/${videoId}`);
    } else {
      navigate('/login');
    }
  };

  const currentVideo = videos[currentIndex];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        bgcolor: 'background.default'
      }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!videos.length) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        bgcolor: 'background.default'
      }}>
        <Typography>No videos available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '80vh' }}>
      <Card sx={{ 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden',
        '&:hover .overlay': {
          opacity: 1,
        }
      }}>
        <CardMedia
          component="img"
          height="100%"
          image={currentVideo.thumbnail || '/placeholder.jpg'}
          alt={currentVideo.title}
          sx={{ 
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        />
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
            opacity: 0.7,
            transition: 'opacity 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 4,
          }}
        >
          <CardContent sx={{ color: 'white' }}>
            <Typography variant="h3" component="div" gutterBottom>
              {currentVideo.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {currentVideo.description}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => handleVideoClick(currentVideo._id)}
              sx={{ 
                bgcolor: 'white',
                color: 'black',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                }
              }}
            >
              {isAuthenticated ? 'Watch Now' : 'Login to Watch'}
            </Button>
          </CardContent>
        </Box>
      </Card>

      <IconButton
        onClick={handlePrevious}
        sx={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          }
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          }
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default VideoCarousel; 