import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteSeries {
  constructor(source?: RemoteSeries, sourcePatch?: Partial<RemoteSeries>) {
    this.genres = api.property('genres', source, sourcePatch, []);
    this.imageUrl = api.property('imageUrl', source, sourcePatch, '');
    this.seasons = api.property('seasons', source, sourcePatch, []);
    this.synopsis = api.property('synopsis', source, sourcePatch, '');
    this.title = api.property('title', source, sourcePatch, '');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @nsg.ApiProperty()
  readonly genres: Array<string>;

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly imageUrl: string;

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteSeriesSeason)
  @nsg.ApiProperty({type: [api.RemoteSeriesSeason]})
  readonly seasons: Array<api.RemoteSeriesSeason>;

  @clv.IsOptional()
  @clv.IsString()
  @nsg.ApiPropertyOptional()
  readonly synopsis?: string;
  
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly title: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
