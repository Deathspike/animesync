import * as clv from 'class-validator';
import * as swg from '@nestjs/swagger';

export class RemoteStreamSubtitle {
  constructor(source: RemoteStreamSubtitle, sourcePatch?: Partial<RemoteStreamSubtitle>) {
    this.language = sourcePatch?.language ?? source.language;
    this.type = sourcePatch?.type ?? source.type;
    this.url = sourcePatch?.url ?? source.url;
  }

  @clv.IsString()
  @clv.IsIn(['ara', 'fre', 'ger', 'ita', 'eng', 'por', 'rus', 'spa'])
  @swg.ApiProperty({enum: ['ara', 'fre', 'ger', 'ita', 'eng', 'por', 'rus', 'spa']})
  readonly language: 'ara' | 'fre' | 'ger' | 'ita' | 'eng' | 'por' | 'rus' | 'spa';

  @clv.IsString()
  @clv.IsIn(['ass', 'vtt'])
  @swg.ApiProperty({enum: ['ass', 'vtt']})
  readonly type: 'ass' | 'vtt';

  @clv.IsString()
  @clv.IsUrl()
  @swg.ApiProperty()
  readonly url: string;
}
