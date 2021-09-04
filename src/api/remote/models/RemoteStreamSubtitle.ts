import * as api from '..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSubtitle {
  constructor(source?: RemoteStreamSubtitle, sourcePatch?: Partial<RemoteStreamSubtitle>) {
    this.language = api.property('language', source, sourcePatch, 'eng');
    this.type = api.property('type', source, sourcePatch, 'srt');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsIn(['ara', 'eng', 'fre', 'ger', 'ita', 'por', 'rus', 'spa', 'spa-419', 'tur'])
  @nsg.ApiProperty({enum: ['ara', 'eng', 'fre', 'ger', 'ita', 'por', 'rus', 'spa', 'spa-419', 'tur']})
  readonly language: 'ara' | 'eng' | 'fre' | 'ger' | 'ita' | 'por' | 'rus' | 'spa' | 'spa-419' | 'tur';

  @clv.IsString()
  @clv.IsIn(['ass', 'srt'])
  @nsg.ApiProperty({enum: ['ass', 'srt']})
  readonly type: 'ass' | 'srt';

  @clv.IsString()
  @clv.IsUrl(api.unsafe({require_tld: false, validate_length: false}))
  @nsg.ApiProperty()
  readonly url: string;
}
