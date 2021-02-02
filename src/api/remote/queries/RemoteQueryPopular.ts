import * as api from '../..';
import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQueryPopular {
  constructor(source?: RemoteQueryPopular, sourcePatch?: Partial<RemoteQueryPopular>) {
    this.pageNumber = api.property('pageNumber', source, sourcePatch, 1);
    this.providerName = api.property('providerName', source, sourcePatch, api.RemoteProvider.CrunchyRoll);
  }

  @clv.IsEnum(api.RemoteProvider)
  @nsg.ApiProperty({enum: api.RemoteProvider})
  readonly providerName: api.RemoteProvider;

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly pageNumber?: number;
}
