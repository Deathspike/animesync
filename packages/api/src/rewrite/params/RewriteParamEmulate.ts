import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RewriteParamEmulate {
  constructor(source?: RewriteParamEmulate, sourcePatch?: Partial<RewriteParamEmulate>) {
    this.emulateUrl = api.property('emulateUrl', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly emulateUrl: string;
}
