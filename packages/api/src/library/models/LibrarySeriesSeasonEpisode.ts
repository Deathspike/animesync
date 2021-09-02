import * as api from '..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibrarySeriesSeasonEpisode {
  constructor(source?: LibrarySeriesSeasonEpisode, sourcePatch?: Partial<LibrarySeriesSeasonEpisode>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.path = api.property('path', source, sourcePatch, '');
    this.active = api.property('active', source, sourcePatch, false);
    this.available = api.property('available', source, sourcePatch, false);
    this.episode = api.property('episode', source, sourcePatch, 0);
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

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly active: boolean;

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly available: boolean;

  @clv.IsNumber()
  @clv.IsPositive()
  @nsg.ApiProperty()
  readonly episode: number;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly synopsis?: string;

  @clv.IsOptional()
  @clv.IsString()
  @nsg.ApiPropertyOptional()
  readonly title?: string;

  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
