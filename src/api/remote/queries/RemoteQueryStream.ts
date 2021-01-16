import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQueryStream {
  constructor(source?: RemoteQueryStream, sourcePatch?: Partial<RemoteQueryStream>) {
    this.url = acm.property('url', source, sourcePatch, '');
  }
  
  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
