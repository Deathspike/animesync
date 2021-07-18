import * as app from '../..';
import {createSettingsCore} from './settings/createSettingsCore';
import {createSettingsCredential} from './settings/createSettingsCredential';
import {createSettingsPath} from './settings/createSettingsPath';
import commander from 'commander';
const format = <T>(x: string, y: T) => `${x}\n-> ${y || ''}`;

export function createSettings() {
  return commander.createCommand('settings')
    .description('Manage settings.')
    .addCommand(createSettingsCore(format).action(settingsAsync))
    .addCommand(createSettingsCredential(format).action(settingsAsync))
    .addCommand(createSettingsPath(format).action(settingsAsync));
}

async function settingsAsync(this: commander.Command) {
  await app.Server.usingAsync(async (api) => {
    const corePromise = api.setting.coreAsync()
    const credentialPromise = api.setting.credentialAsync();
    const pathPromise = api.setting.pathAsync();
    const core = await corePromise.then(x => x.value && new app.api.SettingCore(x.value));
    const credential = await credentialPromise.then(x => x.value && new app.api.SettingCredential(x.value));
    const path = await pathPromise.then(x => x.value && new app.api.SettingPath(x.value));
    if (core && credential && path && (unifySettings(this, core) || unifySettings(this, credential) || unifySettings(this, path))) {
      await Promise.all([api.setting.updateCoreAsync(core), api.setting.updateCredentialAsync(credential), api.setting.updatePathAsync(path)]);
    } else {
      this.outputHelp();
    }
  });
}

function unifySettings(source: Record<string, any>, target: Record<string, any>) {
  return Object.keys(target).reduce((p, key) => {
    const value = source[key];
    if (typeof target[key] !== 'boolean' && value === true) {
      delete target[key];
      return true;
    } else if (typeof value !== 'undefined') {
      target[key] = value || undefined;
      return true;
    } else {
      return p;
    }
  }, false);
}
