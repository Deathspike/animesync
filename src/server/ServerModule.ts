import * as app from './shared';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {LibraryModule} from './library';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import {SettingModule} from './setting';
import fs from 'fs';
import path from 'path';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, LibraryModule, RemoteModule, RewriteModule, SettingModule],
  providers: [app.AgentService, app.BrowserService, app.FileService, app.LoggerService, app.RewriteService],
  exports: [app.AgentService, app.BrowserService, app.FileService, app.LoggerService, app.RewriteService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await pruneAsync(app.settings.path.logger, 604800000);
    await pruneAsync(app.settings.path.sync, 14400000);
  }
}

async function pruneAsync(directoryPath: string, timeout: number) {
  const expireAt = Date.now() - timeout;
  const fileNames = await fs.promises.readdir(directoryPath).catch(() => []);
  const filePaths = fileNames.map(x => path.join(directoryPath, x));
  for (const filePath of filePaths) {
    const stat = await fs.promises.stat(filePath).catch(() => {});
    const mtime = stat && stat.mtime.getTime();
    if (mtime < expireAt) {
      const options = {force: true, recursive: true, maxRetries: 50};
      await fs.promises.rm(filePath, options);
    }
  }
}
