import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class LibrarySeriesSeason {
  constructor(source?: LibrarySeriesSeason, sourcePatch?: Partial<LibrarySeriesSeason>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.path = api.property('path', source, sourcePatch, '');
    this.episodes = api.property('episodes', source, sourcePatch, []);
    this.season = api.property('season', source, sourcePatch, 0);
    this.title = api.property('title', source, sourcePatch, '');
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
  @clt.Type(() => api.LibrarySeriesSeasonEpisode)
  @nsg.ApiProperty({type: [api.LibrarySeriesSeasonEpisode]})
  readonly episodes: Array<api.LibrarySeriesSeasonEpisode>;

  @clv.IsNumber()
  @clv.IsPositive()
  @nsg.ApiProperty()
  readonly season: number;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly title: string;
}
