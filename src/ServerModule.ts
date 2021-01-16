import * as ace from '.';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import fs from 'fs-extra';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, RemoteModule, RewriteModule],
  providers: [ace.shr.AgentService, ace.shr.BrowserService, ace.shr.ContextService, ace.shr.LoggerService],
  exports: [ace.shr.AgentService, ace.shr.BrowserService, ace.shr.ContextService, ace.shr.LoggerService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(ace.settings.cache);
    await fs.remove(ace.settings.sync);
  }
}
