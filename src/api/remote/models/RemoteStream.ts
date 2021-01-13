import * as app from '..';
import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteStream {
  constructor(source: RemoteStream, sourcePatch?: Partial<RemoteStream>) {
    this.subtitles = sourcePatch?.subtitles ?? source.subtitles;
    this.type = sourcePatch?.type ?? source.type;
    this.url = sourcePatch?.url ?? source.url;
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
