import * as os from 'os';
import * as path from 'path';

export const settings = {
  binaries: {
    ffmpeg: os.platform() === 'win32' ? path.join(__dirname, '../bin/ffmpeg.exe') : 'ffmpeg',
    mkvmerge: os.platform() === 'win32' ? path.join(__dirname, '../bin/mkvmerge.exe') : 'mkvmerge',
    youtubedl: os.platform() === 'win32' ? path.join(__dirname, '../bin/youtube-dl.exe') : 'youtube-dl'
  },
  browser: {
    chrome: path.join(os.homedir(), 'animekaizoku', 'chrome'),
    chromeHeadless: false,
    chromeExitTimeout: 5000,
    chromeNavigationTimeout: 30000,
    chromeViewport: {width: 1920, height: 974}
  },
  episode: {
    retryCount: 5,
    retryTimeout: 5000
  }
};
