import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeriesSeasonEpisode {
  constructor(source: RemoteSeriesSeasonEpisode, sourcePatch?: Partial<RemoteSeriesSeasonEpisode>) {
    this.imageUrl = sourcePatch?.imageUrl ?? source.imageUrl;
    this.isPremium = sourcePatch?.isPremium ?? source.isPremium;
    this.number = sourcePatch?.number ?? source.number;
    this.title = sourcePatch?.title ?? source.title;
    this.synopsis = sourcePatch?.synopsis ?? source.synopsis;
    this.url = sourcePatch?.url ?? source.url;
  }

  @clv.IsString()
  @clv.IsUrl()
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
