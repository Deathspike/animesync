import * as os from 'os';
import * as path from 'path';

export const settings = {
  binaries: {
    ffmpeg: os.platform() === 'win32' ? path.join(__dirname, '../bin/ffmpeg.exe') : 'ffmpeg',
    mkvmerge: os.platform() === 'win32' ? path.join(__dirname, '../bin/mkvmerge.exe') : 'mkvmerge',
    youtubedl: os.platform() === 'win32' ? path.join(__dirname, '../bin/youtube-dl.exe') : 'youtube-dl'
  },
  episode: {
    retryCount: 5,
    retryTimeout: 5000
  }
};
