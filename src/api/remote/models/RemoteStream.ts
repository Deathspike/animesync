import * as apx from '../..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source?: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.subtitles = apx.property('subtitles', source, sourcePatch, []);
    this.type = apx.property('type', source, sourcePatch, 'hls');
    this.url = apx.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @swg.ApiProperty({type: [apx.RemoteStreamSubtitle]})
  readonly subtitles: Array<apx.RemoteStreamSubtitle>;
  
  @clv.IsString()
  @clv.IsIn(['hls'])
  @swg.ApiProperty({enum: ['hls']})
  readonly type: 'hls';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @swg.ApiProperty()
  readonly url: string;
}
