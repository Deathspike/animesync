import * as app from '..';
import * as api from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';
import fs from 'fs-extra';

@api.Module({imports: [CoreModule, RemoteModule, RewriteModule]})
export class ServerModule implements api.OnApplicationBootstrap {
  async onApplicationBootstrap() {
    await fs.remove(app.settings.cache);
    await fs.remove(app.settings.sync);
  }
}
