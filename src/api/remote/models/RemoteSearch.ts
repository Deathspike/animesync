import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteSearch {
  constructor(source?: RemoteSearch, sourcePatch?: Partial<RemoteSearch>) {
    this.hasMorePages = api.property('hasMorePages', source, sourcePatch, false);
    this.series = api.property('series', source, sourcePatch, []);
  }

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly hasMorePages: boolean;

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteSearchSeries)
  @nsg.ApiProperty({type: [api.RemoteSearchSeries]})
  readonly series: Array<api.RemoteSearchSeries>;
}
