import * as app from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSearchSeries {
  constructor(source?: RemoteSearchSeries, sourcePatch?: Partial<RemoteSearchSeries>) {
    this.imageUrl = app.property('imageUrl', source, sourcePatch, '');
    this.title = app.property('title', source, sourcePatch, '');
    this.url = app.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @swg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @swg.ApiProperty()
  readonly title: string;

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
