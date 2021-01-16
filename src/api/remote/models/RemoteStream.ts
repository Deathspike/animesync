import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source?: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.subtitles = acm.property('subtitles', source, sourcePatch, []);
    this.type = acm.property('type', source, sourcePatch, 'hls');
    this.url = acm.property('url', source, sourcePatch, '');
  }

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @nsg.ApiProperty({type: [acm.RemoteStreamSubtitle]})
  readonly subtitles: Array<acm.RemoteStreamSubtitle>;
  
  @clv.IsString()
  @clv.IsIn(['hls'])
  @nsg.ApiProperty({enum: ['hls']})
  readonly type: 'hls';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
