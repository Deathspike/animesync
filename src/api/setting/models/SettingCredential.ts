import * as api from '../..';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class SettingCredential {
  constructor(source?: SettingCredential, sourcePatch?: Partial<SettingCredential>) {
    this.crunchyrollUsername = api.property('crunchyrollUsername', source, sourcePatch, undefined);
    this.crunchyrollPassword = api.property('crunchyrollPassword', source, sourcePatch, undefined);
    this.funimationUsername = api.property('funimationUsername', source, sourcePatch, undefined);
    this.funimationPassword = api.property('funimationPassword', source, sourcePatch, undefined);
  }

  @clv.IsOptional()
  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiPropertyOptional()
  readonly crunchyrollUsername?: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiPropertyOptional()
  readonly crunchyrollPassword?: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiPropertyOptional()
  readonly funimationUsername?: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.MinLength(1)
  @nsg.ApiPropertyOptional()
  readonly funimationPassword?: string;
}
