import os from 'os';
import path from 'path';

export const settings = {
  chrome: path.join(os.homedir(), 'animekaizoku', 'chrome-data'),
  chromeHeadless: true,
  chromeExitTimeout: 1000,
  chromeNavigationTimeout: 30000,
  chromeViewport: {width: 1920, height: 974},
  library: path.join(os.homedir(), 'animekaizoku', 'library'),
  sync: path.join(os.homedir(), 'animekaizoku', 'sync')
};
