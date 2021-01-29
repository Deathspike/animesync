import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source?: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.subtitles = api.property('subtitles', source, sourcePatch, []);
    this.type = api.property('type', source, sourcePatch, 'hls');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteStreamSubtitle)
  @nsg.ApiProperty({type: [api.RemoteStreamSubtitle]})
  readonly subtitles: Array<api.RemoteStreamSubtitle>;
  
  @clv.IsString()
  @clv.IsIn(['hls'])
  @nsg.ApiProperty({enum: ['hls']})
  readonly type: 'hls';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
