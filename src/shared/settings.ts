import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const defaultPaths = {
  cache: path.join(os.homedir(), 'animesync', 'cache'),
  chrome: path.join(os.homedir(), 'animesync', 'chrome-data'),
  library: path.join(os.homedir(), 'animesync', 'library'),
  logger: path.join(os.homedir(), 'animesync', 'logger'),
  sync: path.join(os.homedir(), 'animesync', 'sync')
};

const defaultSettings = {
  cacheRemoteSearchTimeout: 3600000,
  cacheRemoteSeriesTimeout: 900000,
  cacheRemoteStreamTimeout: 300000,
  chromeHeadless: true,
  chromeInactiveTimeout: 1000,
  chromeNavigationTimeout: 30000,
  chromeObserverTimeout: 30000,
  chromeViewport: '1920x974',
  proxyServer: '',
  serverPort: 6583
};

const mergedSettings = Object.assign(defaultPaths, defaultSettings, fs.readJsonSync(
  path.join(os.homedir(), 'animesync', 'settings.json'),
  {throws: false}) as {});

export const settings = Object.assign(mergedSettings, {
  serverUrl: `http://localhost:${mergedSettings.serverPort}/`
});
