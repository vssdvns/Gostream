const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 6001;

app.use(cors());
app.use(express.json());

// Ensure upload directories exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const ENCODED_DIR = path.join(__dirname, 'encoded');
[UPLOAD_DIR, ENCODED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer setup
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Encoding route
app.post('/encode', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

  const inputPath = req.file.path;
  const outputFilename = Date.now() + '-encoded.mp4';
  const outputPath = path.join(ENCODED_DIR, outputFilename);

  const ffmpegCmd = `ffmpeg -i "${inputPath}" -preset fast -c:v libx264 -crf 28 -c:a aac "${outputPath}"`;

  exec(ffmpegCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Encoding error:', err);
      return res.status(500).json({ error: 'Encoding failed' });
    }

    console.log('Encoded video at:', outputPath);
    res.json({ encodedPath: `/encoded/${outputFilename}` });
  });
});

// Serve encoded videos statically
app.use('/encoded', express.static(ENCODED_DIR));

app.listen(PORT, () => {
  console.log(`Encoder service running on http://localhost:${PORT}`);
});
