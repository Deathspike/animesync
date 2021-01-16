import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RewriteParamEmulate {
  constructor(source?: RewriteParamEmulate, sourcePatch?: Partial<RewriteParamEmulate>) {
    this.url = acm.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
