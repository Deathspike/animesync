import * as app from './shared';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {LibraryModule} from './library';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import {SettingModule} from './setting';
import fs from 'fs-extra';
import path from 'path';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, LibraryModule, RemoteModule, RewriteModule, SettingModule],
  providers: [app.AgentService, app.BrowserService, app.CacheService, app.ContextService, app.LoggerService, app.RewriteService],
  exports: [app.AgentService, app.BrowserService, app.CacheService, app.ContextService, app.LoggerService, app.RewriteService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    const cacheTimeout = Math.max(app.settings.core.cacheTimeoutSeries, app.settings.core.cacheTimeoutStream);
    await pruneAsync(app.settings.path.cache, cacheTimeout);
    await pruneAsync(app.settings.path.logger, 604800000);
    await pruneAsync(app.settings.path.sync, 14400000);
  }
}

async function pruneAsync(directoryPath: string, timeout: number) {
  if (!await fs.pathExists(directoryPath)) return;
  const expireTime = Date.now() - timeout;
  const fileNames = await fs.readdir(directoryPath);
  const filePaths = fileNames.map(x => path.join(directoryPath, x));
  await Promise.all(filePaths.map(async (filePath) => {
    const stat = await fs.stat(filePath).catch(() => {});
    const mtime = stat && stat.mtime.getTime();
    if (mtime < expireTime) await fs.remove(filePath);
  }));
}
