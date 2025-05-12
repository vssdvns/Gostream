import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Rating,
  Divider,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  ThumbUpAlt,
  ThumbDownAlt,
  Share,
  Delete,
  Star,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import axios from 'axios';
import SubscriptionDialog from '../components/SubscriptionDialog';

const API_URL = process.env.REACT_APP_CONTENT_API_URL || 'http://localhost:5002/api';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_CONTENT_API_URL}/videos/${id}`);
        console.log('Video response:', response.data); // Debug log
        
        // Ensure the videoUrl is properly formatted
        let videoUrl = response.data.videoUrl;
        if (!videoUrl.startsWith('http')) {
          videoUrl = `${process.env.REACT_APP_CONTENT_API_URL.replace('/api', '')}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
        }
        console.log('Final video URL:', videoUrl); // Debug log
        
        const videoData = {
          ...response.data,
          url: videoUrl,
          thumbnail: response.data.thumbnail 
            ? `${process.env.REACT_APP_CONTENT_API_URL.replace('/api', '')}${response.data.thumbnail}`
            : null
        };
        
        setVideo(videoData);
        setError(null);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('mousemove', handleMouseMove);
      return () => {
        videoElement.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
      };
    }
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      navigate('/');
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video. Please try again later.');
    }
  };

  const handleAddToList = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/users/list`,
        { videoId: id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (err) {
      console.error('Error adding to list:', err);
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/videos/${id}/rate`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (err) {
      console.error('Error rating video:', err);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_CONTENT_API_URL}/subscriptions`, {

        userId: user._id,
        plan: plan.name,
        price: plan.price,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setSubscriptionDialogOpen(false);
        // Show success message
        setError(null);
        // Refresh user data to update subscription status
        // You might want to dispatch an action to update the user state
      }
    } catch (err) {
      console.error('Subscription error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to process subscription. Please try again.');
      }
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

  if (!video) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
        {loading ? (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'black'
          }}>
            <CircularProgress />
          </Box>
        ) : video ? (
          <video
            ref={videoRef}
            src={video.url}
            controls={showControls}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            poster={video.thumbnail}
            onError={(e) => {
              console.error('Video error:', e);
              setError('Failed to play video. Please check the video URL and try again.');
            }}
          />
        ) : (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'black'
          }}>
            <Typography color="error">Video not found</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          {video.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {video.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Avatar src={video.user?.avatar} sx={{ mr: 1 }} />
          <Typography variant="subtitle1">
            {video.user?.username}
          </Typography>
        </Box>
        {!user?.subscription && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                setSubscriptionDialogOpen(true);
              }
            }}
            sx={{ mt: 2 }}
          >
            {isAuthenticated ? 'Subscribe to Watch' : 'Login to Subscribe'}
          </Button>
        )}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddToList}
        >
          Add to My List
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ color: 'white' }}>Rate:</Typography>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              onClick={() => handleRate(star)}
              sx={{ color: 'gold' }}
            >
              <Star />
            </IconButton>
          ))}
        </Box>
      </Box>
      {user?.role === 'admin' && (
        <IconButton
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ ml: 2 }}
        >
          <Delete />
        </IconButton>
      )}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this video? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </Box>
  );
};

export default VideoPlayer; 