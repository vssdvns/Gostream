// videoProcessor.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

function encodeVideo(inputPath, outputName, callback) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const outputPath = path.join(outputDir, outputName);

  ffmpeg(inputPath)
    .outputOptions([
      '-c:v libx264',
      '-preset veryfast',
      '-crf 23',
      '-c:a aac',
      '-b:a 128k'
    ])
    .on('end', () => callback(null, outputPath))
    .on('error', (err) => callback(err, null))
    .save(outputPath);
}

module.exports = { encodeVideo };
