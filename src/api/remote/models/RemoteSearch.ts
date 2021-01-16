import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSearch {
  constructor(source?: RemoteSearch, sourcePatch?: Partial<RemoteSearch>) {
    this.hasMorePages = apx.property('hasMorePages', source, sourcePatch, false);
    this.series = apx.property('series', source, sourcePatch, []);
  }

  @clv.IsBoolean()
  @swg.ApiProperty()
  readonly hasMorePages: boolean;

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [apx.RemoteSearchSeries]})
  readonly series: Array<apx.RemoteSearchSeries>;
}
