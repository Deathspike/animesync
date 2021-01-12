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
  @app.ResponseValidator(app.models.RemoteSearch)
  @swg.ApiResponse({status: 200, type: app.models.RemoteSearch})
  async popularAsync(@api.Query() model: app.RemoteQueryPopular) {
    const context = this._contextService.get();
    return app.provider.popularAsync(context, model.providerName, model.pageNumber);
  }

  @api.Get('series')
  @app.ResponseValidator(app.models.RemoteSeries)
  @swg.ApiResponse({status: 200, type: app.models.RemoteSeries})
  async seriesAsync(@api.Query() model: app.RemoteQuerySeries) {
    const context = this._contextService.get();
    return app.provider.seriesAsync(context, model.url);
  }

  @api.Get('stream')
  @app.ResponseValidator(app.models.RemoteStream)
  @swg.ApiResponse({status: 200, type: app.models.RemoteStream})
  async streamAsync(@api.Query() model: app.RemoteQueryStream) {
    const context = this._contextService.get();
    return app.provider.streamAsync(context, model.url);
  }
}
