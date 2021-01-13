import * as api from '@nestjs/common';
import {CoreModule} from './core';
import {RemoteModule} from './remote';
import {RewriteModule} from './rewrite';

@api.Module({imports: [CoreModule, RemoteModule, RewriteModule]})
export class ServerModule {}
