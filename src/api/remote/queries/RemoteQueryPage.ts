import * as api from '../..';
import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQueryPage {
  constructor(source?: RemoteQueryPage, sourcePatch?: Partial<RemoteQueryPage>) {
    this.provider = api.property('provider', source, sourcePatch, undefined);
    this.page = api.property('page', source, sourcePatch, undefined);
    this.options = api.property('options', source, sourcePatch, undefined);
    this.pageNumber = api.property('pageNumber', source, sourcePatch, 1);
  }

  @clv.IsEnum(api.RemoteProviderId)
  @nsg.ApiProperty({enum: api.RemoteProviderId})
  readonly provider?: api.RemoteProviderId;

  @clv.IsOptional()
  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiPropertyOptional()
  readonly page?: string;

  @clv.IsOptional()
  @clv.IsArray()
  @clt.Transform(x => [].concat(x))
  @nsg.ApiPropertyOptional({type: [String]})
  readonly options?: Array<string>;

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly pageNumber?: number;
}
