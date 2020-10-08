import * as app from '..';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export async function settingsAsync(values: {[key: string]: boolean | string | undefined}) {
  const settingsPath = path.join(os.homedir(), 'animesync', 'settings.json');
  const settings = await fs.readJson(settingsPath, {throws: false}) || {};
  if (mergeSettings(values, settings)) {
    await fs.writeJson(settingsPath, settings, {spaces: 2});
    return false;
  } else {
    return true;
  }
}

function mergeSettings(values: {[key: string]: boolean | string | undefined}, settings: {[key: string]: boolean | number | string}) {
  return Object.keys(app.settings).reduce((p, key) => {
    const value = values[key];
    if (value === true) {
      delete settings[key];
      return true;
    } else if (typeof value !== 'undefined') {
      settings[key] = value;
      return true;
    } else {
      return p;
    }
  }, false);
}
