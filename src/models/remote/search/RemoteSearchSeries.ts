import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSearchSeries {
  constructor(source: RemoteSearchSeries, sourcePatch?: Partial<RemoteSearchSeries>) {
    this.imageUrl = sourcePatch?.imageUrl ?? source.imageUrl;
    this.title = sourcePatch?.title ?? source.title;
    this.url = sourcePatch?.url ?? source.url;
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
