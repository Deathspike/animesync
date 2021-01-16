import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteQueryStream {
  constructor(source?: RemoteQueryStream, sourcePatch?: Partial<RemoteQueryStream>) {
    this.url = apx.property('url', source, sourcePatch, '');
  }
  
  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
