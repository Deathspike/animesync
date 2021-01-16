import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSearchSeries {
  constructor(source?: RemoteSearchSeries, sourcePatch?: Partial<RemoteSearchSeries>) {
    this.imageUrl = acm.property('imageUrl', source, sourcePatch, '');
    this.title = acm.property('title', source, sourcePatch, '');
    this.url = acm.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly title: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
