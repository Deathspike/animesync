import * as os from 'os';
import * as path from 'path';

export const binaries = {
  ffmpeg: os.platform() === 'win32' ? path.join(__dirname, '../bin/ffmpeg.exe') : 'ffmpeg',
  mkvmerge: os.platform() === 'win32' ? path.join(__dirname, '../bin/mkvmerge.exe') : 'mkvmerge',
  youtubedl: os.platform() === 'win32' ? path.join(__dirname, '../bin/youtube-dl.exe') : 'youtube-dl'
};

export const settings = {
  chrome: path.join(os.homedir(), 'animekaizoku', 'chrome'),
  chromeHeadless: true,
  chromeExitTimeout: 5000,
  chromeNavigationTimeout: 30000,
  chromeViewport: {width: 1920, height: 974},
  episode: path.join(os.homedir(), 'animekaizoku', 'sync'),
  episodeRetryCount: 5,
  episodeRetryTimeout: 5000
};
