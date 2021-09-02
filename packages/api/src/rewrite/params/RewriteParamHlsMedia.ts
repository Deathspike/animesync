import * as api from '..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RewriteParamHlsMedia {
  constructor(source?: RewriteParamHlsMedia, sourcePatch?: Partial<RewriteParamHlsMedia>) {
    this.mediaUrl = api.property('mediaUrl', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly mediaUrl: string;
}
