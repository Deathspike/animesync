import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQueryContext {
  constructor(source?: RemoteQueryContext, sourcePatch?: Partial<RemoteQueryContext>) {
    this.url = api.property('url', source, sourcePatch, undefined);
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiPropertyOptional()
  readonly url?: string;
}
