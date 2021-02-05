import * as app from '../..';

export async function settingsAsync(values: Record<string, boolean | string | undefined>) {
  return await app.Server.usingAsync(async (api) => {
    const corePromise = api.setting.coreAsync()
    const credentialPromise = api.setting.credentialAsync();
    const pathPromise = api.setting.pathAsync();
    const core = await corePromise;
    const credential = await credentialPromise;
    const path = await pathPromise;
    if (core.value && credential.value && path.value && (mergeSettings(values, core.value) || mergeSettings(values, credential.value) || mergeSettings(values, path.value))) {
      await Promise.all([api.setting.updateCoreAsync(core.value), api.setting.updateCredentialAsync(credential.value), api.setting.updatePathAsync(path.value)]);
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
      target[key] = value;
      return true;
    } else {
      return p;
    }
  }, false);
}
