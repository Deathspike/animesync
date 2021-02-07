import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class RemoteProviderPage {
  constructor(source?: RemoteProviderPage, sourcePatch?: Partial<RemoteProviderPage>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.label = api.property('label', source, sourcePatch, '');
    this.options = api.property('options', source, sourcePatch, []);
    this.type = api.property('type', source, sourcePatch, 'oneOf');
  }

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly id: string;

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly label: string;

  @clv.IsOptional()
  @clv.IsArray()
  @clv.ValidateNested()
  @clt.Type(() => api.RemoteProviderPageOption)
  @nsg.ApiPropertyOptional({type: [api.RemoteProviderPageOption]})
  readonly options: api.RemoteProviderPageOption[];

  @clv.IsString()
  @clv.IsEnum({enum: ['mixOf', 'oneOf']})
  @nsg.ApiProperty({enum: ['mixOf', 'oneOf']})
  readonly type: 'mixOf' | 'oneOf';
}
