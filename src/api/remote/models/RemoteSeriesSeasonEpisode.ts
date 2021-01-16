import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSeriesSeasonEpisode {
  constructor(source?: RemoteSeriesSeasonEpisode, sourcePatch?: Partial<RemoteSeriesSeasonEpisode>) {
    this.imageUrl = acm.property('imageUrl', source, sourcePatch, '');
    this.isPremium = acm.property('isPremium', source, sourcePatch, false);
    this.number = acm.property('number', source, sourcePatch, '');
    this.title = acm.property('title', source, sourcePatch, '');
    this.synopsis = acm.property('synopsis', source, sourcePatch, '');
    this.url = acm.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly isPremium: boolean;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly number: string;

  @clv.IsOptional()
  @clv.IsString()
  @nsg.ApiPropertyOptional()
  readonly title?: string;

  @clv.IsOptional()
  @clv.IsString()
  @nsg.ApiPropertyOptional()
  readonly synopsis?: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
