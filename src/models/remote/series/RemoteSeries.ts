import * as app from '..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeries {
  constructor(source: RemoteSeries, sourcePatch?: Partial<RemoteSeries>) {
    this.genres = sourcePatch?.genres ?? source.genres;
    this.imageUrl = sourcePatch?.imageUrl ?? source.imageUrl;
    this.seasons = sourcePatch?.seasons ?? source.seasons;
    this.synopsis = sourcePatch?.synopsis ?? source.synopsis;
    this.title = sourcePatch?.title ?? source.title;
    this.url = sourcePatch?.url ?? source.url;
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @swg.ApiProperty()
  readonly genres: Array<string>;

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [app.RemoteSeriesSeason]})
  readonly seasons: Array<app.RemoteSeriesSeason>;

  @clv.IsOptional()
  @clv.IsString()
  @swg.ApiPropertyOptional()
  readonly synopsis?: string;
  
  @clv.IsString()
  @clv.IsNotEmpty()
  @swg.ApiProperty()
  readonly title: string;

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
