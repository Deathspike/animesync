import * as app from './shared';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import {SettingModule} from './setting';
import fs from 'fs-extra';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, RemoteModule, RewriteModule, SettingModule],
  providers: [app.AgentService, app.BrowserService, app.CacheService, app.LoggerService, app.RewriteService],
  exports: [app.AgentService, app.BrowserService, app.CacheService, app.LoggerService, app.RewriteService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(app.settings.path.cache);
    await fs.remove(app.settings.path.sync);
  }
}
