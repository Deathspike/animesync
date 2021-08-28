import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class LibraryContentSeries {
  constructor(source?: LibraryContentSeries, sourcePatch?: Partial<LibraryContentSeries>) {
    this.rootPath = api.property('rootPath', source, sourcePatch, undefined);
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly rootPath?: string;
  
  @clv.IsString()
  @clv.IsUrl()
  @nsg.ApiProperty()
  readonly url: string;
}
