import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteProvider {
  constructor(source?: RemoteProvider, sourcePatch?: Partial<RemoteProvider>) {
    this.id = api.property('id', source, sourcePatch, undefined);
    this.label = api.property('label', source, sourcePatch, '');
    this.pages = api.property('pages', source, sourcePatch, []);
  }

  @clv.IsEnum(api.RemoteProviderId)
  @nsg.ApiProperty({enum: api.RemoteProviderId})
  readonly id?: api.RemoteProviderId;

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly label: string;

  @clv.IsArray()
  @clv.ArrayNotEmpty()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteProviderPage)
  @nsg.ApiProperty({type: [api.RemoteProviderPage]})
  readonly pages: api.RemoteProviderPage[];
}
