import * as app from '.';
import fs from 'fs';
import os from 'os';
import path from 'path';

const defaultCore = new app.api.SettingCore({
  chromeHeadless: true,
  chromeTimeout: 300000,
  chromeTimeoutAction: 30000,
  chromeTimeoutNavigation: 60000,
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
  chrome: path.join(os.homedir(), 'animesync', 'chrome-data'),
  library: path.join(os.homedir(), 'animesync', 'library'),
  logger: path.join(os.homedir(), 'animesync', 'logger'),
  sync: path.join(os.homedir(), 'animesync', 'sync')
});

const settingOverrides = (() => {
  const filePath = path.join(os.homedir(), 'animesync', 'settings.json');
  return fs.existsSync(filePath) && JSON.parse(fs.readFileSync(filePath, 'utf8'));
})();

export const settings = {
  core: new app.api.SettingCore(defaultCore, settingOverrides),
  credential: new app.api.SettingCredential(defaultCredential, settingOverrides),
  path: new app.api.SettingPath(defaultPath, settingOverrides),
  server: {port: 6583, url: `http://127.0.0.1:6583/`},
  source: {defaultCore, defaultCredential, defaultPath}
};
