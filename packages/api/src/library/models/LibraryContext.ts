import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class LibraryContext {
  constructor(source?: LibraryContext, sourcePatch?: Partial<LibraryContext>) {
    this.rootPaths = api.property('rootPaths', source, sourcePatch, []);
    this.series = api.property('series', source, sourcePatch, []);
  }
  
  @clv.IsArray()
  @clv.IsString({each: true})
  @clv.IsNotEmpty({each: true})
  @nsg.ApiProperty()
  readonly rootPaths: Array<string>;

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.LibraryContextSeries)
  @nsg.ApiProperty({type: [api.LibraryContextSeries]})
  readonly series: Array<api.LibraryContextSeries>;
}
