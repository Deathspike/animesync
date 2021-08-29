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
  providers: [app.AgentService, app.BrowserService, app.CacheService, app.FileService, app.LoggerService, app.RewriteService],
  exports: [app.AgentService, app.BrowserService, app.CacheService, app.FileService, app.LoggerService, app.RewriteService]})
export class ServerModule implements ncm.OnApplicationBootstrap {
  private readonly fileService: app.FileService;

  constructor(fileService: app.FileService) {
    this.fileService = fileService;
  }

  async onApplicationBootstrap() {
    await this.fileService.deleteAsync(app.settings.path.cache);
    await this.fileService.deleteAsync(app.settings.path.sync);
  }
}
