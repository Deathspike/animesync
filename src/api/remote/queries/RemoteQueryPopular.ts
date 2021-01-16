import * as acm from '../..';
import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as nsg from '@nestjs/swagger';

export class RemoteQueryPopular {
  constructor(source?: RemoteQueryPopular, sourcePatch?: Partial<RemoteQueryPopular>) {
    this.providerName = acm.property('providerName', source, sourcePatch, 'crunchyroll');
    this.pageNumber = acm.property('pageNumber', source, sourcePatch, 1);
  }

  @clv.IsString()
  @clv.IsIn(['crunchyroll', 'funimation'])
  @nsg.ApiProperty({enum: ['crunchyroll', 'funimation']})
  readonly providerName: 'crunchyroll' | 'funimation';
  
  @clv.IsOptional()
  @clv.IsNumber()
  @clv.Min(1)
  @clt.Type(() => Number)
  @nsg.ApiPropertyOptional()
  readonly pageNumber?: number;
}
