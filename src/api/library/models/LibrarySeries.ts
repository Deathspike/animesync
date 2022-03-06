import * as api from '..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class LibrarySeries {
  constructor(source?: LibrarySeries, sourcePatch?: Partial<LibrarySeries>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.path = api.property('path', source, sourcePatch, '');
    this.seasons = api.property('seasons', source, sourcePatch, []);
    this.synopsis = api.property('synopsis', source, sourcePatch, '');
    this.title = api.property('title', source, sourcePatch, '');
    this.url = api.property('url', source, sourcePatch, undefined);
  }
  
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly id: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly path: string;

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.LibrarySeriesSeason)
  @nsg.ApiProperty({type: [api.LibrarySeriesSeason]})
  readonly seasons: Array<api.LibrarySeriesSeason>;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly synopsis?: string;
  
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly title: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url?: string;
}
