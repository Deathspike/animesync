import * as api from '..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryParamSeriesEpisode {
  constructor(source?: LibraryParamSeriesEpisode, sourcePatch?: Partial<LibraryParamSeriesEpisode>) {
    this.seriesId = api.property('seriesId', source, sourcePatch, '');
    this.episodeId = api.property('episodeId', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seriesId: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly episodeId: string;
}
