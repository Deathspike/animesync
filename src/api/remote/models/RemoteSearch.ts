import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSearch {
  constructor(source?: RemoteSearch, sourcePatch?: Partial<RemoteSearch>) {
    this.hasMorePages = acm.property('hasMorePages', source, sourcePatch, false);
    this.series = acm.property('series', source, sourcePatch, []);
  }

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly hasMorePages: boolean;

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @nsg.ApiProperty({type: [acm.RemoteSearchSeries]})
  readonly series: Array<acm.RemoteSearchSeries>;
}
