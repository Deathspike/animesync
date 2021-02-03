import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller('api/remote')
@ncm.UseInterceptors(app.ResponseLoggerInterceptor)
@nsg.ApiTags('remote')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RemoteController {
  private readonly cacheService: app.CacheService;
  private readonly providerService: app.ProviderService;

  constructor(cacheService: app.CacheService, providerService: app.ProviderService) {
    this.cacheService = cacheService;
    this.providerService = providerService;
  }

  @app.ResponseValidator([app.api.RemoteProvider])
  @ncm.Get()
  @nsg.ApiResponse({status: 200, type: [app.api.RemoteProvider]})
  context() {
    return this.providerService.context();
  }

  @app.ResponseValidator(app.api.RemoteSearch)
  @ncm.Get('page')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteSearch})
  async pageAsync(@ncm.Query() model: app.api.RemoteQueryPage) {
    const cacheKey = `${model.page}/${model.provider}/${model.options?.join(',')}/${model.pageNumber || 1}`;
    const cacheTimeout = app.settings.cacheRemotePageTimeout;
    return await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.pageAsync(model.provider!, model.page, model.options, model.pageNumber));
  }

  @app.ResponseValidator(app.api.RemoteSearch)
  @ncm.Get('popular')
  @nsg.ApiExcludeEndpoint()
  async popularAsync(@ncm.Query() model: app.api.RemoteQueryPage) {
    return await this.pageAsync(model);
  }

  @app.ResponseValidator(app.api.RemoteSearch)
  @ncm.Get('search')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteSearch})
  async searchAsync(@ncm.Query() model: app.api.RemoteQuerySearch) {
    const cacheKey = `search/${model.provider}/${model.query}/${model.pageNumber || 1}`;
    const cacheTimeout = app.settings.cacheRemoteSearchTimeout;
    return await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.searchAsync(model.provider!, model.query, model.pageNumber));
  }

  @app.ResponseValidator(app.api.RemoteSeries)
  @ncm.Get('series')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteSeries})
  async seriesAsync(@ncm.Query() model: app.api.RemoteQuerySeries) {
    const cacheKey = `series/${model.url}`;
    const cacheTimeout = app.settings.cacheRemoteSeriesTimeout;
    return await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.seriesAsync(model.url));
  }

  @app.ResponseValidator(app.api.RemoteStream)
  @ncm.Get('stream')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteStream})
  async streamAsync(@ncm.Query() model: app.api.RemoteQueryStream) {
    const cacheKey = `stream/${model.url}`;
    const cacheTimeout = app.settings.cacheRemoteStreamTimeout;
    return await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.streamAsync(model.url));
  }
}
