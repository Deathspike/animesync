const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function compress(relativePath) {
  const sourcePath = path.join(__dirname, relativePath);
  const destinationPath = path.join(__dirname, `${relativePath}.gz`);
  if (fs.existsSync(sourcePath)) {
    fs.createReadStream(sourcePath)
      .pipe(zlib.createGzip())
      .pipe(fs.createWriteStream(destinationPath))
      .on('close', () => fs.unlinkSync(sourcePath));
  }
}

compress('linux/ffmpeg');
compress('mac/ffmpeg');
compress('windows/ffmpeg.exe');
