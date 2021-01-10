import * as app from '.';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';

@api.Controller('remote')
@swg.ApiTags('remote')
@swg.ApiBadRequestResponse()
@swg.ApiInternalServerErrorResponse()
export class RemoteController {
  constructor(private readonly context: app.ContextService) {}
  
  @api.Get('popular')
  @app.ResponseValidator(app.models.RemoteSearch)
  @swg.ApiResponse({status: 200, type: app.models.RemoteSearch})
  async popularAsync(@api.Query() model: app.RemoteQueryPopular) {
    const context = await this.context.getAsync();
    return app.provider.popularAsync(context, model.providerName, model.pageNumber);
  }

  @api.Get('series')
  @app.ResponseValidator(app.models.RemoteSeries)
  @swg.ApiResponse({status: 200, type: app.models.RemoteSeries})
  async seriesAsync(@api.Query() model: app.RemoteQuerySeries) {
    const context = await this.context.getAsync();
    return app.provider.seriesAsync(context, model.url);
  }

  @api.Get('stream')
  @app.ResponseValidator(app.models.RemoteStream)
  @swg.ApiResponse({status: 200, type: app.models.RemoteStream})
  async streamAsync(@api.Query() model: app.RemoteQueryStream) {
    const context = await this.context.getAsync();
    return app.provider.streamAsync(context, model.url);
  }
}
