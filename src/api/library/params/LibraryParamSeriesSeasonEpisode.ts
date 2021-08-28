import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryParamSeriesSeasonEpisode {
  constructor(source?: LibraryParamSeriesSeasonEpisode, sourcePatch?: Partial<LibraryParamSeriesSeasonEpisode>) {
    this.seriesId = api.property('seriesId', source, sourcePatch, '');
    this.seasonId = api.property('seasonId', source, sourcePatch, '');
    this.episodeId = api.property('episodeId', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seriesId: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seasonId: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly episodeId: string;
}
