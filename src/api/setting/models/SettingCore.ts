import * as api from '../..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as nsg from '@nestjs/swagger';

export class SettingCore {
  constructor(source?: SettingCore, sourcePatch?: Partial<SettingCore>) {
    this.chromeHeadless = api.property('chromeHeadless', source, sourcePatch, false);
    this.chromeTimeoutInactive = api.property('chromeTimeoutInactive', source, sourcePatch, 0);
    this.chromeTimeoutNavigation = api.property('chromeTimeoutNavigation', source, sourcePatch, 0);
    this.chromeViewport = api.property('chromeViewport', source, sourcePatch, '');
    this.fetchMaximumRetries = api.property('fetchMaximumRetries', source, sourcePatch, 0);
    this.fetchTimeoutRequest = api.property('fetchTimeoutRequest', source, sourcePatch, 0);
    this.fetchTimeoutRetry = api.property('fetchTimeoutRetry', source, sourcePatch, 0);
    this.ffmpeg = api.property('ffmpeg', source, sourcePatch, undefined);
    this.proxyServer = api.property('proxyServer', source, sourcePatch, undefined);
  }

  @clv.IsBoolean()
  @nsg.ApiProperty()
  readonly chromeHeadless: boolean;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiProperty()
  readonly chromeTimeoutInactive: number;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiProperty()
  readonly chromeTimeoutNavigation: number;

  @clv.IsString()
  @clv.Matches(/^[0-9]+x[0-9]+$/)
  @nsg.ApiProperty()
  readonly chromeViewport: string;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiProperty()
  readonly fetchMaximumRetries: number;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiProperty()
  readonly fetchTimeoutRequest: number;

  @clv.IsNumber()
  @clv.IsPositive()
  @clt.Type(() => Number)
  @nsg.ApiProperty()
  readonly fetchTimeoutRetry: number;

  @clv.IsOptional()
  @clv.IsString()
  @clv.IsNotEmpty()
  @nsg.ApiPropertyOptional()
  readonly ffmpeg?: string;

  @clv.IsOptional()
  @clv.IsString()
  @clv.Matches(/^(http|https|socks|socks4|socks5)\:\/\/(?:(.+)\:(.+)@)?(?:.+)$/)
  @nsg.ApiPropertyOptional()
  readonly proxyServer?: string;
}
