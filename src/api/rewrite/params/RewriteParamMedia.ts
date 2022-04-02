import * as api from '..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RewriteParamMedia {
  constructor(source?: RewriteParamMedia, sourcePatch?: Partial<RewriteParamMedia>) {
    this.mediaUrl = api.property('mediaUrl', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly mediaUrl: string;
}
