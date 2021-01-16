import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteSeries {
  constructor(source?: RemoteSeries, sourcePatch?: Partial<RemoteSeries>) {
    this.genres = acm.property('genres', source, sourcePatch, []);
    this.imageUrl = acm.property('imageUrl', source, sourcePatch, '');
    this.seasons = acm.property('seasons', source, sourcePatch, []);
    this.synopsis = acm.property('synopsis', source, sourcePatch, '');
    this.title = acm.property('title', source, sourcePatch, '');
    this.url = acm.property('url', source, sourcePatch, '');
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
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @nsg.ApiProperty({type: [acm.RemoteSeriesSeason]})
  readonly seasons: Array<acm.RemoteSeriesSeason>;

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
