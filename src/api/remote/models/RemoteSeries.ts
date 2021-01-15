import * as app from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeries {
  constructor(source?: RemoteSeries, sourcePatch?: Partial<RemoteSeries>) {
    this.genres = app.property('genres', source, sourcePatch, []);
    this.imageUrl = app.property('imageUrl', source, sourcePatch, '');
    this.seasons = app.property('seasons', source, sourcePatch, []);
    this.synopsis = app.property('synopsis', source, sourcePatch, '');
    this.title = app.property('title', source, sourcePatch, '');
    this.url = app.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @swg.ApiProperty()
  readonly genres: Array<string>;

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
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
