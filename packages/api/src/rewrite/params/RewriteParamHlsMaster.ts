import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RewriteParamHlsMaster {
  constructor(source?: RewriteParamHlsMaster, sourcePatch?: Partial<RewriteParamHlsMaster>) {
    this.masterUrl = api.property('masterUrl', source, sourcePatch, '');
    this.mediaUrl = api.property('mediaUrl', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly masterUrl: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly mediaUrl: string;
}
