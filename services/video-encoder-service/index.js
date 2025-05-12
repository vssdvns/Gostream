const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set up Express
const app = express();
const PORT = 4000;

// Set up storage and uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Encoding endpoint
app.post('/api/encode', upload.single('video'), (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send('No video file uploaded.');
  }

  const inputPath = req.file.path;
  const outputFilename = `${Date.now()}-output.mp4`;
  const outputPath = path.join(uploadDir, outputFilename);

  const command = `ffmpeg -i "${inputPath}" -c:v libx264 -preset ultrafast -c:a aac "${outputPath}"`;

  console.log(`Running command: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Encoding error:', error.message);
      console.error('FFmpeg stderr:', stderr);
      return res.status(500).send('Encoding failed');
    }

    console.log('Encoding successful:', stdout);
    res.status(200).json({
      message: 'Encoding complete',
      encodedFile: outputFilename,
    });
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('Video Encoder Service is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Video encoder service running on port ${PORT}`);
});
