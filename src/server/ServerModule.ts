import * as app from './shared';
import * as api from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import fs from 'fs-extra';

@api.Global()
@api.Module({
  imports: [CoreModule, RemoteModule, RewriteModule],
  providers: [app.AgentService, app.ContextService],
  exports: [app.AgentService, app.ContextService]})
export class ServerModule implements api.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(app.settings.cache);
    await fs.remove(app.settings.sync);
  }
}
