import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryParamSeriesSeason {
  constructor(source?: LibraryParamSeriesSeason, sourcePatch?: Partial<LibraryParamSeriesSeason>) {
    this.seriesId = api.property('seriesId', source, sourcePatch, '');
    this.seasonId = api.property('seasonId', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seriesId: string;

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seasonId: string;
}
