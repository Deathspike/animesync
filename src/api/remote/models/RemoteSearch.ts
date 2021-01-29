import * as api from '../..';
import * as clv from 'class-validator';
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
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @nsg.ApiProperty({type: [api.RemoteSearchSeries]})
  readonly series: Array<api.RemoteSearchSeries>;
}
