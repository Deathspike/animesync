import * as app from '.';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';

@api.Controller('api/remote')
@swg.ApiTags('remote')
@swg.ApiBadRequestResponse()
@swg.ApiInternalServerErrorResponse()
export class RemoteController {
  private readonly _contextService: app.ContextService;

  constructor(contextService: app.ContextService) {
    this._contextService = contextService;
  }

  @api.Get('popular')
  @app.ResponseValidator(app.api.RemoteSearch)
  @swg.ApiResponse({status: 200, type: app.api.RemoteSearch})
  async popularAsync(@api.Query() model: app.api.RemoteQueryPopular) {
    const context = this._contextService.get();
    return app.provider.popularAsync(context, model.providerName, model.pageNumber);
  }

  @api.Get('series')
  @app.ResponseValidator(app.api.RemoteSeries)
  @swg.ApiResponse({status: 200, type: app.api.RemoteSeries})
  async seriesAsync(@api.Query() model: app.api.RemoteQuerySeries) {
    const context = this._contextService.get();
    return app.provider.seriesAsync(context, model.url);
  }

  @api.Get('stream')
  @app.ResponseValidator(app.api.RemoteStream)
  @swg.ApiResponse({status: 200, type: app.api.RemoteStream})
  async streamAsync(@api.Query() model: app.api.RemoteQueryStream) {
    const context = this._contextService.get();
    return app.provider.streamAsync(context, model.url);
  }
}
