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
  private readonly composeService: app.ComposeService;
  private readonly providerService: app.ProviderService;

  constructor(cacheService: app.CacheService, composeService: app.ComposeService, providerService: app.ProviderService) {
    this.cacheService = cacheService;
    this.composeService = composeService;
    this.providerService = providerService;
  }

  @app.ResponseValidator(app.api.RemoteSeries)
  @ncm.Get('series')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteSeries})
  @nsg.ApiResponse({status: 404})
  async seriesAsync(@ncm.Query() query: app.api.RemoteQuerySeries) {
    const cacheKey = `remote/series/${query.url}`;
    const cacheTimeout = app.settings.core.cacheTimeoutSeries;
    return this.composeService.series(await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.seriesAsync(query.url)));
  }

  @app.ResponseValidator(app.api.RemoteStream)
  @ncm.Get('stream')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteStream})
  @nsg.ApiResponse({status: 404})
  async streamAsync(@ncm.Query() query: app.api.RemoteQueryStream) {
    const cacheKey = `remote/stream/${query.url}`;
    const cacheTimeout = app.settings.core.cacheTimeoutStream;
    return await this.composeService.streamAsync(await this.cacheService.getAsync(cacheKey, cacheTimeout, () => this.providerService.streamAsync(query.url)));
  }
}
