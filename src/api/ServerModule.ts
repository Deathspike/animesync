import * as api from '@nestjs/common';
import {RemoteModule} from './remote';

@api.Module({imports: [RemoteModule]})
export class ServerModule {}
