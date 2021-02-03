import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSource {
  constructor(source?: RemoteStreamSource, sourcePatch?: Partial<RemoteStreamSource>) {
    this.bandwidth = api.property('bandwidth', source, sourcePatch, undefined);
    this.resolutionX = api.property('resolutionX', source, sourcePatch, undefined);
    this.resolutionY = api.property('resolutionY', source, sourcePatch, undefined);
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly bandwidth?: number;

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly resolutionX?: number;
  
  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly resolutionY?: number;

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
