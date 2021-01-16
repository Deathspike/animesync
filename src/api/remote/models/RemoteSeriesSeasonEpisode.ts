import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeriesSeasonEpisode {
  constructor(source?: RemoteSeriesSeasonEpisode, sourcePatch?: Partial<RemoteSeriesSeasonEpisode>) {
    this.imageUrl = apx.property('imageUrl', source, sourcePatch, '');
    this.isPremium = apx.property('isPremium', source, sourcePatch, false);
    this.number = apx.property('number', source, sourcePatch, '');
    this.title = apx.property('title', source, sourcePatch, '');
    this.synopsis = apx.property('synopsis', source, sourcePatch, '');
    this.url = apx.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @swg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsBoolean()
  @swg.ApiProperty()
  readonly isPremium: boolean;

  @clv.IsString()
  @clv.IsNotEmpty()
  @swg.ApiProperty()
  readonly number: string;

  @clv.IsOptional()
  @clv.IsString()
  @swg.ApiPropertyOptional()
  readonly title?: string;

  @clv.IsOptional()
  @clv.IsString()
  @swg.ApiPropertyOptional()
  readonly synopsis?: string;

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
