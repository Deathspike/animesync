import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryContextSeries {
  constructor(source?: LibraryContextSeries, sourcePatch?: Partial<LibraryContextSeries>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.path = api.property('path', source, sourcePatch, '');
    this.seasons = api.property('seasons', source, sourcePatch, undefined);
    this.synopsis = api.property('synopsis', source, sourcePatch, '');
    this.title = api.property('title', source, sourcePatch, '');
    this.url = api.property('url', source, sourcePatch, '');
  }
  
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly id: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly path: string;

  @clv.IsOptional()
  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @clv.ArrayNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly seasons?: Array<string>;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
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
