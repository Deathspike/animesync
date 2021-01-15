import * as app from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeriesSeasonEpisode {
  constructor(source?: RemoteSeriesSeasonEpisode, sourcePatch?: Partial<RemoteSeriesSeasonEpisode>) {
    this.imageUrl = app.property('imageUrl', source, sourcePatch, '');
    this.isPremium = app.property('isPremium', source, sourcePatch, false);
    this.number = app.property('number', source, sourcePatch, '');
    this.title = app.property('title', source, sourcePatch, '');
    this.synopsis = app.property('synopsis', source, sourcePatch, '');
    this.url = app.property('url', source, sourcePatch, '');
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
