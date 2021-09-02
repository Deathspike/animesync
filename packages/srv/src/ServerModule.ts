import * as app from './shared';
import * as ncm from '@nestjs/common';
import {CoreModule} from './core';
import {LibraryModule} from './library';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import {SettingModule} from './setting';

@ncm.Global()
@ncm.Module({
  imports: [CoreModule, LibraryModule, RemoteModule, RewriteModule, SettingModule],
  providers: [app.AgentService, app.BrowserService, app.FileService, app.LoggerService, app.RewriteService],
  exports: [app.AgentService, app.BrowserService, app.FileService, app.LoggerService, app.RewriteService]})
export class ServerModule {}
