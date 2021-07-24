import * as app from '..';
import * as ncm from '@nestjs/common';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

@ncm.Injectable()
export class SettingService {
  private readonly agentService: app.AgentService;
  private readonly browserService: app.BrowserService;
  private readonly cacheService: app.CacheService;

  constructor(agentService: app.AgentService, browserService: app.BrowserService, cacheService: app.CacheService) {
    this.agentService = agentService;
    this.browserService = browserService;
    this.cacheService = cacheService;
  }

  async coreAsync(core: app.api.SettingCore) {
    if (shallowEquals(app.settings.core, core)) return;
    app.settings.core = core;
    await this.restartAsync();
    await this.saveAsync();
  }

  async credentialAsync(credential: app.api.SettingCredential) {
    if (shallowEquals(app.settings.credential, credential)) return;
    app.settings.credential = credential;
    await this.restartAsync();
    await this.saveAsync();
  }

  async pathAsync(path: app.api.SettingPath) {
    if (shallowEquals(app.settings.path, path)) return;
    app.settings.path = path;
    await this.restartAsync();
    await this.saveAsync();
  }

  private async restartAsync() {
    const agentPromise = this.agentService.onModuleDestroy();
    const browserPromise = this.browserService.onModuleDestroy();
    const cachePromise = this.cacheService.onModuleDestroy();
    await Promise.all([agentPromise, browserPromise, cachePromise]);
    await fs.remove(app.settings.path.chrome);
  }

  private async saveAsync() {
    const settingOverrides = Object.assign({},
      shallowDiff(app.settings.core, app.settings.source.defaultCore),
      shallowDiff(app.settings.credential, app.settings.source.defaultCredential),
      shallowDiff(app.settings.path, app.settings.source.defaultPath));
    await fs.ensureDir(path.join(os.homedir(), 'animesync'));
    await fs.writeJson(path.join(os.homedir(), 'animesync', 'settings.json'), settingOverrides, {spaces: 2});
  }
}

function shallowDiff(a: Record<string, any>, b: Record<string, any>) {
  const result: Record<string, any> = {};
  Object.keys(a).filter(x => a[x] !== b[x]).forEach(x => result[x] = a[x]);
  return result;
}

function shallowEquals(a: Record<string, any>, b: Record<string, any>) {
  if (Object.keys(a).some(x => !(x in b) || a[x] !== b[x])) return false;
  if (Object.keys(b).some(x => !(x in a) || a[x] !== b[x])) return false;
  return true;
}
