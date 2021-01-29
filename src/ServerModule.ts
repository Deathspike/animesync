import * as app from './shared';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import fs from 'fs-extra';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, RemoteModule, RewriteModule],
  providers: [app.AgentService, app.BrowserService, app.ContextService, app.LoggerService],
  exports: [app.AgentService, app.BrowserService, app.ContextService, app.LoggerService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(app.settings.cache);
    await fs.remove(app.settings.sync);
  }
}
