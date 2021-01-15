import * as app from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source?: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.subtitles = app.property('subtitles', source, sourcePatch, []);
    this.type = app.property('type', source, sourcePatch, 'hls');
    this.url = app.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [app.RemoteStreamSubtitle]})
  readonly subtitles: Array<app.RemoteStreamSubtitle>;
  
  @clv.IsString()
  @clv.IsIn(['hls'])
  @swg.ApiProperty({enum: ['hls']})
  readonly type: 'hls';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @swg.ApiProperty()
  readonly url: string;
}
