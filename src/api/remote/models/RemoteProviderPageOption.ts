import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteProviderPageOption {
  constructor(source?: RemoteProviderPageOption, sourcePatch?: Partial<RemoteProviderPageOption>) {
    this.id = api.property('id', source, sourcePatch, '');
    this.label = api.property('label', source, sourcePatch, '');
  }

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly id: string;

  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiProperty()
  readonly label: string;
}
