import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSubtitle {
  constructor(source?: RemoteStreamSubtitle, sourcePatch?: Partial<RemoteStreamSubtitle>) {
    this.language = api.property('language', source, sourcePatch, 'eng');
    this.type = api.property('type', source, sourcePatch, 'vtt');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsIn(['ara', 'fre', 'ger', 'ita', 'eng', 'por', 'rus', 'spa'])
  @nsg.ApiProperty({enum: ['ara', 'fre', 'ger', 'ita', 'eng', 'por', 'rus', 'spa']})
  readonly language: 'ara' | 'fre' | 'ger' | 'ita' | 'eng' | 'por' | 'rus' | 'spa';

  @clv.IsString()
  @clv.IsIn(['ass', 'vtt'])
  @nsg.ApiProperty({enum: ['ass', 'vtt']})
  readonly type: 'ass' | 'vtt';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
