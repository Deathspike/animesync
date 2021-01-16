import * as app from '.';
import * as api from '@nestjs/common';
import fs from 'fs-extra';

@api.Global()
@api.Module({
  imports: [app.core.CoreModule, app.remote.RemoteModule, app.rewrite.RewriteModule],
  providers: [app.shared.AgentService, app.shared.BrowserService, app.shared.ContextService, app.shared.LoggerService],
  exports: [app.shared.AgentService, app.shared.BrowserService, app.shared.ContextService, app.shared.LoggerService]})
export class ServerModule implements api.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(app.settings.cache);
    await fs.remove(app.settings.sync);
  }
}
