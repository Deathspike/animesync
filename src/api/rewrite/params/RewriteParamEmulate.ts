import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RewriteParamEmulate {
  constructor(source?: RewriteParamEmulate, sourcePatch?: Partial<RewriteParamEmulate>) {
    this.url = apx.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
