import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryParamSeries {
  constructor(source?: LibraryParamSeries, sourcePatch?: Partial<LibraryParamSeries>) {
    this.seriesId = api.property('seriesId', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiProperty()
  readonly seriesId: string;
}
