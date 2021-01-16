import * as ace from '..';
import * as acm from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller('api/remote')
@ncm.UseInterceptors(ace.shr.ResponseLoggerInterceptor)
@nsg.ApiTags('remote')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RemoteController {
  private readonly _cacheService: acm.CacheService;
  private readonly _providerService: acm.ProviderService;

  constructor(cacheService: acm.CacheService, providerService: acm.ProviderService) {
    this._cacheService = cacheService;
    this._providerService = providerService;
  }

  @ace.shr.ResponseValidator(ace.api.RemoteSearch)
  @ncm.Get('popular')
  @nsg.ApiResponse({status: 200, type: ace.api.RemoteSearch})
  async popularAsync(@ncm.Query() model: ace.api.RemoteQueryPopular) {
    const cacheKey = `popular/${model.providerName}/${model.pageNumber || 1}`;
    const cacheTimeout = ace.settings.cacheRemoteSearchTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.popularAsync(model.providerName, model.pageNumber));
  }

  @ace.shr.ResponseValidator(ace.api.RemoteSeries)
  @ncm.Get('series')
  @nsg.ApiResponse({status: 200, type: ace.api.RemoteSeries})
  async seriesAsync(@ncm.Query() model: ace.api.RemoteQuerySeries) {
    const cacheKey = `series/${model.url}`;
    const cacheTimeout = ace.settings.cacheRemoteSeriesTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.seriesAsync(model.url));
  }

  @ace.shr.ResponseValidator(ace.api.RemoteStream)
  @ncm.Get('stream')
  @nsg.ApiResponse({status: 200, type: ace.api.RemoteStream})
  async streamAsync(@ncm.Query() model: ace.api.RemoteQueryStream) {
    const cacheKey = `stream/${model.url}`;
    const cacheTimeout = ace.settings.cacheRemoteStreamTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.streamAsync(model.url));
  }
}
