import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export const settings = {
  chrome: path.join(os.homedir(), 'animesync', 'chrome-data'),
  chromeHeadless: true,
  chromeInactiveTimeout: 1000,
  chromeNavigationTimeout: 30000,
  chromeObserverTimeout: 30000,
  chromeViewport: {width: 1920, height: 974},
  httpProxy: '',
  library: path.join(os.homedir(), 'animesync', 'library'),
  sync: path.join(os.homedir(), 'animesync', 'sync')
};

Object.assign(settings, fs.readJsonSync(
  path.join(os.homedir(), 'animesync', 'settings.json'),
  {throws: false}));
