require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 5003;

const encoderHosts = [
  'https://d319-2601-204-cd03-4fd0-00-9d5.ngrok-free.app',
  // Add fallback domains here if available
];

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://webstream258.online',
    'https://www.webstream258.online',
    'https://gostream-frontend.fly.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

const uploadsPath = '/app/uploads';
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  category: { type: String, required: true, enum: ['movie', 'series', 'documentary', 'kids'] },
  rating: { type: Number, default: 0 },
  releaseYear: { type: Number, required: true },
  cast: [String],
  director: String,
  createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', videoSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.get('/api/videos', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const videos = await Video.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((page - 1) * limit);
    const total = await Video.countDocuments(query);
    res.json({ videos, totalPages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/videos', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files?.thumbnail || !req.files?.video) {
      return res.status(400).json({ error: 'Thumbnail and video files are required' });
    }

    const { title, description, category, duration, releaseYear, cast, director } = req.body;
    if (!title || !description || !category || !duration || !releaseYear) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const thumbnailPath = `/uploads/${req.files.thumbnail[0].filename}`;
    const rawVideoPath = req.files.video[0].path;
    let videoPath;

    const tryEncode = async (host) => {
      const healthCheck = await axios.get(`${host}/health`, { timeout: 2000 });
      if (healthCheck.data.status !== 'ok') throw new Error('Encoder health check failed');

      const formData = new FormData();
      formData.append('video', fs.createReadStream(rawVideoPath));
      const encodeRes = await axios.post(`${host}/encode`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!encodeRes.data.encodedPath) throw new Error('No encodedPath returned');
      return encodeRes.data.encodedPath;
    };

    for (let host of encoderHosts) {
      try {
        videoPath = await tryEncode(host);
        console.log(`Video encoded using ${host}`);
        break;
      } catch (err) {
        console.warn(`Failed to encode with ${host}:`, err.message);
      }
    }

    if (!videoPath) {
      console.warn('Falling back to raw upload');
      videoPath = `/uploads/${req.files.video[0].filename}`;
    }

    const video = new Video({
      title,
      description,
      thumbnail: thumbnailPath,
      videoUrl: videoPath,
      duration: parseInt(duration),
      category,
      releaseYear: parseInt(releaseYear),
      cast: cast ? cast.split(',').map(actor => actor.trim()) : [],
      director: director || ''
    });

    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    if (req.files?.thumbnail && fs.existsSync(req.files.thumbnail[0].path)) {
      fs.unlinkSync(req.files.thumbnail[0].path);
    }
    if (req.files?.video && fs.existsSync(req.files.video[0].path)) {
      fs.unlinkSync(req.files.video[0].path);
    }
    res.status(500).json({ error: 'Error creating video: ' + error.message });
  }
});

app.put('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (video.thumbnail && fs.existsSync(path.join(uploadsPath, path.basename(video.thumbnail)))) {
      fs.unlinkSync(path.join(uploadsPath, path.basename(video.thumbnail)));
    }
    if (video.videoUrl && fs.existsSync(path.join(uploadsPath, path.basename(video.videoUrl)))) {
      fs.unlinkSync(path.join(uploadsPath, path.basename(video.videoUrl)));
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/content/test', (req, res) => {
  res.send('Content API working!');
});

app.get('/', (req, res) => {
  res.send('Content service is up and running!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Content service running on port ${PORT}`);
});
