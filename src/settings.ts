import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const defaultPaths = {
  chrome: path.join(os.homedir(), 'animesync', 'chrome-data'),
  library: path.join(os.homedir(), 'animesync', 'library'),
  sync: path.join(os.homedir(), 'animesync', 'sync'),
};

const defaultSettings = {
  chromeHeadless: true,
  chromeInactiveTimeout: 1000,
  chromeNavigationTimeout: 30000,
  chromeObserverTimeout: 30000,
  chromeViewport: '1920x974',
  proxyServer: '',
};

export const settings = Object.assign(defaultPaths, defaultSettings, fs.readJsonSync(
  path.join(os.homedir(), 'animesync', 'settings.json'),
  {throws: false}) as {});
