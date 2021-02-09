import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteStreamSubtitle {
  constructor(source?: RemoteStreamSubtitle, sourcePatch?: Partial<RemoteStreamSubtitle>) {
    this.language = api.property('language', source, sourcePatch, 'en-US');
    this.type = api.property('type', source, sourcePatch, 'vtt');
    this.url = api.property('url', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.IsIn(['ar-ME', 'de-DE', 'en-US', 'es-ES', 'es-LA', 'fr-FR', 'it-IT', 'pt-BR', 'ru-RU'])
  @nsg.ApiProperty({enum: ['ar-ME', 'de-DE', 'en-US', 'es-ES', 'es-LA', 'fr-FR', 'it-IT', 'pt-BR', 'ru-RU']})
  readonly language: 'ar-ME' | 'de-DE' | 'en-US' | 'es-ES' | 'es-LA' | 'fr-FR' | 'it-IT' | 'pt-BR' | 'ru-RU';

  @clv.IsString()
  @clv.IsIn(['ass', 'vtt'])
  @nsg.ApiProperty({enum: ['ass', 'vtt']})
  readonly type: 'ass' | 'vtt';

  @clv.IsString()
  @clv.IsUrl({require_tld: false})
  @nsg.ApiProperty()
  readonly url: string;
}
