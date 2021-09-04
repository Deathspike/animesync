import * as app from '.';
import * as ncm from '@nestjs/common';
import * as nsg from '@nestjs/swagger';

@ncm.Controller('api/remote')
@ncm.UseInterceptors(app.ResponseLoggerInterceptor)
@nsg.ApiTags('remote')
@nsg.ApiBadRequestResponse()
@nsg.ApiInternalServerErrorResponse()
export class RemoteController {
  private readonly composeService: app.ComposeService;
  private readonly providerService: app.ProviderService;

  constructor(composeService: app.ComposeService, providerService: app.ProviderService) {
    this.composeService = composeService;
    this.providerService = providerService;
  }

  @app.ResponseValidator(app.api.RemoteSeries)
  @ncm.Get('series')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteSeries})
  @nsg.ApiResponse({status: 404})
  async seriesAsync(@ncm.Query() query: app.api.RemoteQuerySeries) {
    const value = await this.providerService.seriesAsync(query.url);
    return this.composeService.series(value);
  }

  @app.ResponseValidator(app.api.RemoteStream)
  @ncm.Get('stream')
  @nsg.ApiResponse({status: 200, type: app.api.RemoteStream})
  @nsg.ApiResponse({status: 404})
  async streamAsync(@ncm.Query() query: app.api.RemoteQueryStream) {
    const value = await this.providerService.streamAsync(query.url);
    return this.composeService.streamAsync(value);
  }
}
