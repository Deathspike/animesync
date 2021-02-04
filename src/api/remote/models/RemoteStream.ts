import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source?: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.sources = api.property('sources', source, sourcePatch, []);
    this.subtitles = api.property('subtitles', source, sourcePatch, []);
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteStreamSource)
  @nsg.ApiProperty({type: [api.RemoteStreamSource]})
  readonly sources: Array<api.RemoteStreamSource>;

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteStreamSubtitle)
  @nsg.ApiProperty({type: [api.RemoteStreamSubtitle]})
  readonly subtitles: Array<api.RemoteStreamSubtitle>;
}
