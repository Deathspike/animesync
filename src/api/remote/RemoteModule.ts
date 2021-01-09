import * as app from '.';
import * as api from '@nestjs/common';

@api.Module({controllers: [app.RemoteController], providers: [app.ContextService]})
export class RemoteModule {}
