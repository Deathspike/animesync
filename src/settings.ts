import * as app from '.';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const defaultCore = new app.api.SettingCore({
  cacheTimeoutSeries: 900000,
  cacheTimeoutStream: 300000,
  chromeHeadless: true,
  chromeTimeoutInactive: 600000,
  chromeTimeoutNavigation: 30000,
  chromeViewport: '1920x974',
  fetchMaximumRetries: 8,
  fetchTimeoutRequest: 30000,
  fetchTimeoutRetry: 3750
});

const defaultCredential = new app.api.SettingCredential({
  crunchyrollUsername: undefined,
  crunchyrollPassword: undefined,
  funimationUsername: undefined,
  funimationPassword: undefined
});

const defaultPath = new app.api.SettingPath({
  cache: path.join(os.homedir(), 'animesync', 'cache'),
  chrome: path.join(os.homedir(), 'animesync', 'chrome-data'),
  library: path.join(os.homedir(), 'animesync', 'library'),
  logger: path.join(os.homedir(), 'animesync', 'logger'),
  sync: path.join(os.homedir(), 'animesync', 'sync')
});

const settingOverrides = fs.readJsonSync(
  path.join(os.homedir(), 'animesync', 'settings.json'),
  {throws: false});

export const settings = {
  core: new app.api.SettingCore(defaultCore, settingOverrides),
  credential: new app.api.SettingCredential(defaultCredential, settingOverrides),
  path: new app.api.SettingPath(defaultPath, settingOverrides),
  source: {defaultCore, defaultCredential, defaultPath}
};
