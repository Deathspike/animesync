import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteSeries {
  constructor(source?: RemoteSeries, sourcePatch?: Partial<RemoteSeries>) {
    this.genres = apx.property('genres', source, sourcePatch, []);
    this.imageUrl = apx.property('imageUrl', source, sourcePatch, '');
    this.seasons = apx.property('seasons', source, sourcePatch, []);
    this.synopsis = apx.property('synopsis', source, sourcePatch, '');
    this.title = apx.property('title', source, sourcePatch, '');
    this.url = apx.property('url', source, sourcePatch, '');
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
  @swg.ApiProperty({type: [apx.RemoteSeriesSeason]})
  readonly seasons: Array<apx.RemoteSeriesSeason>;

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
