import * as acm from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSubtitle {
  constructor(source?: RemoteStreamSubtitle, sourcePatch?: Partial<RemoteStreamSubtitle>) {
    this.language = acm.property('language', source, sourcePatch, 'eng');
    this.type = acm.property('type', source, sourcePatch, 'vtt');
    this.url = acm.property('url', source, sourcePatch, '');
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
