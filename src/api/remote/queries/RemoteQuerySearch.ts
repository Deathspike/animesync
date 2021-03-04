import * as api from '../..';
import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQuerySearch {
  constructor(source?: RemoteQuerySearch, sourcePatch?: Partial<RemoteQuerySearch>) {
    this.provider = api.property('provider', source, sourcePatch, '');
    this.query = api.property('query', source, sourcePatch, '');
    this.pageNumber = api.property('pageNumber', source, sourcePatch, 1);
  }

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly provider: string;

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly query: string;

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly pageNumber?: number;
}
