import * as app from '..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSearch {
  constructor(source: RemoteSearch, sourcePatch?: Partial<RemoteSearch>) {
    this.hasMorePages = sourcePatch?.hasMorePages ?? source.hasMorePages;
    this.series = sourcePatch?.series ?? source.series;
  }

  @clv.IsBoolean()
  @swg.ApiProperty()
  readonly hasMorePages: boolean;

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [app.RemoteSearchSeries]})
  readonly series: Array<app.RemoteSearchSeries>;
}
