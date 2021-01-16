import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RewriteParamHls {
  constructor(source?: RewriteParamHls, sourcePatch?: Partial<RewriteParamHls>) {
    this.url = apx.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
