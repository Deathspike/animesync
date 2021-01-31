const baseUrl = 'https://github.com/animeloyalty/animeloyalty-static/raw/master/ffmpeg';
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function download(relativePath, url) {
  const staticPath = path.join(__dirname, 'static');
  const ffmpegPath = path.join(staticPath, relativePath);
  if (!fs.existsSync(staticPath)) fs.mkdirSync(staticPath);
  fetch.default(url).then((res) => res.body
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream(ffmpegPath))
    .on('close', () => fs.chmodSync(ffmpegPath, '755')));
}

switch (process.platform) {
  case 'darwin':
    download('ffmpeg', `${baseUrl}/mac/ffmpeg.gz`);
    break;
  case 'linux':
    download('ffmpeg', `${baseUrl}/linux/ffmpeg.gz`);
    break;
  case 'win32':
    download('ffmpeg.exe', `${baseUrl}/windows/ffmpeg.exe.gz`);
    break;
}
