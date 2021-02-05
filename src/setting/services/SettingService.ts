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
    app.settings.core = core;
    await this.restartAsync();
    await this.saveAsync();
  }

  async credentialAsync(credential: app.api.SettingCredential) {
    app.settings.credential = credential;
    await this.restartAsync();
    await this.saveAsync();
  }

  async pathAsync(path: app.api.SettingPath) {
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
    const settingsPath = path.join(os.homedir(), 'animesync', 'settings.json');
    const settingOverrides = Object.assign({},
      shallowDiff(app.settings.core, app.settings.source.defaultCore),
      shallowDiff(app.settings.credential, app.settings.source.defaultCredential),
      shallowDiff(app.settings.path, app.settings.source.defaultPath));
    await fs.writeJson(settingsPath, settingOverrides, {spaces: 2});
  }
}

function shallowDiff(current: Record<string, any>, b: Record<string, any>) {
  const result: Record<string, any> = {};
  Object.keys(current).filter(x => current[x] !== b[x]).forEach(x => result[x] = current[x]);
  return result;
}
