import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_CONTENT_API_URL || 'http://localhost:5002';

const VideoUpload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    releaseYear: '',
    cast: '',
    director: '',
    video: null,
    thumbnail: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.video || !formData.thumbnail) {
      setError('Please select both a video file and a thumbnail image');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('releaseYear', formData.releaseYear);
      formDataToSend.append('cast', formData.cast);
      formDataToSend.append('director', formData.director);
      formDataToSend.append('video', formData.video);
      formDataToSend.append('thumbnail', formData.thumbnail);

      console.log("Upload to:", `${API_URL}/api/videos`);
      const response = await axios.post(`${API_URL}/videos`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Error uploading video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Video
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="movie">Movie</MenuItem>
                  <MenuItem value="series">Series</MenuItem>
                  <MenuItem value="documentary">Documentary</MenuItem>
                  <MenuItem value="kids">Kids</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Release Year"
                name="releaseYear"
                type="number"
                value={formData.releaseYear}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Director"
                name="director"
                value={formData.director}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cast (comma-separated)"
                name="cast"
                value={formData.cast}
                onChange={handleChange}
                placeholder="Actor 1, Actor 2, Actor 3"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={!formData.video ? 'error' : 'primary'}
              >
                Upload Video File
                <input
                  type="file"
                  name="video"
                  onChange={handleFileChange}
                  accept="video/*"
                  hidden
                />
              </Button>
              {formData.video && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {formData.video.name}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={!formData.thumbnail ? 'error' : 'primary'}
              >
                Upload Thumbnail
                <input
                  type="file"
                  name="thumbnail"
                  onChange={handleFileChange}
                  accept="image/*"
                  hidden
                />
              </Button>
              {formData.thumbnail && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {formData.thumbnail.name}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Video'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default VideoUpload; 