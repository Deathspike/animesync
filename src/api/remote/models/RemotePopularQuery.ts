import * as app from '..';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as swg from '@nestjs/swagger';

export class RemotePopularQuery {
  @clv.IsString()
  @clv.IsEnum(app.IApiProviderName)
  @swg.ApiProperty({enum: app.IApiProviderName})
  readonly providerName!: app.IApiProviderName;
  
  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @swg.ApiPropertyOptional()
  readonly pageNumber?: number;
}
