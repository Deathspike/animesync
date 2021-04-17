import * as app from '../..';

export async function settingsAsync(values: Record<string, boolean | string | undefined>) {
  return await app.Server.usingAsync(async (api) => {
    const corePromise = api.setting.coreAsync()
    const credentialPromise = api.setting.credentialAsync();
    const pathPromise = api.setting.pathAsync();
    const core = await corePromise.then(x => x.value && new app.api.SettingCore(x.value));
    const credential = await credentialPromise.then(x => x.value && new app.api.SettingCredential(x.value));
    const path = await pathPromise.then(x => x.value && new app.api.SettingPath(x.value));
    if (core && credential && path && (mergeSettings(values, core) || mergeSettings(values, credential) || mergeSettings(values, path))) {
      await Promise.all([api.setting.updateCoreAsync(core), api.setting.updateCredentialAsync(credential), api.setting.updatePathAsync(path)]);
      return false;
    } else {
      return true;
    }
  });
}

function mergeSettings(source: Record<string, any>, target: Record<string, any>) {
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
