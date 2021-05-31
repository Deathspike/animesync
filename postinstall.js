const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
let apiUrl = 'https://api.github.com/repos/animeloyalty/animeloyalty-static/contents/';
let rawUrl = 'https://github.com/animeloyalty/animeloyalty-static/raw/master/';
let staticPath = path.join(__dirname, 'static');

async function checksumAsync(remotePath) {
  return await fetch.default(new URL(path.dirname(remotePath), apiUrl))
    .then(x => x.json())
    .then(x => x.find(x => x.name === path.basename(remotePath)).sha);
}

async function downloadAsync(localPath, remotePath) {
  return await new Promise((resolve, reject) => {
    fetch.default(new URL(remotePath, rawUrl)).then((res) => res.body
      .pipe(zlib.createGunzip())
      .pipe(fs.createWriteStream(localPath))
      .on('error', reject)
      .on('finish', resolve));
  });
}

async function ffmpegAsync(localName, remotePath) {
  const hashPath = path.join(staticPath, `${localName}.cks`);
  const localHash = await fs.readFile(hashPath, 'utf8').catch(() => {});
  const remoteHash = await checksumAsync(remotePath);
  if (localHash !== remoteHash) {
    await fs.ensureDir(staticPath);
    await downloadAsync(path.join(staticPath, localName), remotePath);
    await fs.chmod(path.join(staticPath, localName), '755');
    await fs.writeFile(hashPath, remoteHash);
  }
}

switch (process.platform) {
  case 'darwin':
    ffmpegAsync('ffmpeg', 'ffmpeg/mac/ffmpeg.gz');
    break;
  case 'win32':
    ffmpegAsync('ffmpeg.exe', 'ffmpeg/windows/ffmpeg.exe.gz');
    break;
}
