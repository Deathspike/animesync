import * as os from 'os';
import * as path from 'path';

export const settings = {
  chrome: path.join(os.homedir(), 'animekaizoku', 'chrome'),
  chromeHeadless: true,
  chromeExitTimeout: 5000,
  chromeNavigationTimeout: 30000,
  chromeViewport: {width: 1920, height: 974},
  episode: path.join(os.homedir(), 'animekaizoku', 'sync'),
  episodeRetryCount: 5,
  episodeRetryTimeout: 5000,
  seriesTrace: '_trace.json'
};
