import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSeriesSeasonEpisode {
  constructor(source?: RemoteSeriesSeasonEpisode, sourcePatch?: Partial<RemoteSeriesSeasonEpisode>) {
    this.imageUrl = api.property('imageUrl', source, sourcePatch, undefined);
    this.isPremium = api.property('isPremium', source, sourcePatch, false);
    this.name = api.property('name', source, sourcePatch, '');
    this.title = api.property('title', source, sourcePatch, '');
    this.synopsis = api.property('synopsis', source, sourcePatch, '');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiPropertyOptional()
  readonly imageUrl?: string;

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly isPremium: boolean;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly name: string;

  @clv.IsOptional()
  @clv.IsString()
  @nsg.ApiPropertyOptional()
  readonly title?: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly synopsis?: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
