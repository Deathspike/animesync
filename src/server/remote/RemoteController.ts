import * as app from '.';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';

@api.Controller('api/remote')
@swg.ApiTags('remote')
@swg.ApiBadRequestResponse()
@swg.ApiInternalServerErrorResponse()
export class RemoteController {
  private readonly _cacheService: app.CacheService;
  private readonly _providerService: app.ProviderService;

  constructor(cacheService: app.CacheService, providerService: app.ProviderService) {
    this._cacheService = cacheService;
    this._providerService = providerService;
  }

  @api.Get('popular')
  @app.ResponseValidator(app.api.RemoteSearch)
  @swg.ApiResponse({status: 200, type: app.api.RemoteSearch})
  async popularAsync(@api.Query() model: app.api.RemoteQueryPopular) {
    const cacheKey = `popular/${model.providerName}/${model.pageNumber || 1}`;
    const cacheTimeout = app.settings.cacheRemoteSearchTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.popularAsync(model.providerName, model.pageNumber));
  }

  @api.Get('series')
  @app.ResponseValidator(app.api.RemoteSeries)
  @swg.ApiResponse({status: 200, type: app.api.RemoteSeries})
  async seriesAsync(@api.Query() model: app.api.RemoteQuerySeries) {
    const cacheKey = `series/${model.url}`;
    const cacheTimeout = app.settings.cacheRemoteSeriesTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.seriesAsync(model.url));
  }

  @api.Get('stream')
  @app.ResponseValidator(app.api.RemoteStream)
  @swg.ApiResponse({status: 200, type: app.api.RemoteStream})
  async streamAsync(@api.Query() model: app.api.RemoteQueryStream) {
    const cacheKey = `stream/${model.url}`;
    const cacheTimeout = app.settings.cacheRemoteStreamTimeout;
    return await this._cacheService.getAsync(cacheKey, cacheTimeout, () => this._providerService.streamAsync(model.url));
  }
}
