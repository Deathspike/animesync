import * as api from '..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSource {
  constructor(source?: RemoteStreamSource, sourcePatch?: Partial<RemoteStreamSource>) {
    this.bandwidth = api.property('bandwidth', source, sourcePatch, undefined);
    this.resolutionX = api.property('resolutionX', source, sourcePatch, undefined);
    this.resolutionY = api.property('resolutionY', source, sourcePatch, undefined);
    this.type = api.property('type', source, sourcePatch, 'hls');
    this.url = api.property('url', source, sourcePatch, '');
  }

  static compareFn(a: RemoteStreamSource, b: RemoteStreamSource) {
    if (a.resolutionX !== b.resolutionX) return (b.resolutionX ?? 0) - (a.resolutionX ?? 0);
    if (a.resolutionY !== b.resolutionY) return (b.resolutionY ?? 0) - (a.resolutionY ?? 0);
    return (b.bandwidth ?? 0) - (a.bandwidth ?? 0);
  }
  
  @clv.IsOptional()
  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly bandwidth?: number;

  @clv.IsOptional()
  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly resolutionX?: number;
  
  @clv.IsOptional()
  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly resolutionY?: number;

  @clv.IsString()
  @clv.IsIn(['hls'])
  @nsg.ApiProperty({enum: ['hls']})
  readonly type: 'hls';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
