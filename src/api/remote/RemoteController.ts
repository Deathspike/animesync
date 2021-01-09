import * as app from '.';
import * as api from '@nestjs/common';
import * as swg from '@nestjs/swagger';

@api.Controller('remote')
@swg.ApiTags('remote')
@swg.ApiInternalServerErrorResponse()
export class RemoteController {
  constructor(private readonly context: app.ContextService) {}
  
  @api.Get('popular')
  @app.ResponseValidator(app.IApiQuery)
  @swg.ApiResponse({status: 200, type: app.IApiQuery})
  async popularAsync(@api.Query() model: app.RemotePopularQuery) {
    const context = await this.context.getAsync();
    return app.provider.popularAsync(context, model.providerName, model.pageNumber);
  }

  @api.Get('series')
  @app.ResponseValidator(app.IApiSeries)
  @swg.ApiResponse({status: 200, type: app.IApiSeries})
  async seriesAsync(@api.Query() model: app.RemoteSeriesQuery) {
    const context = await this.context.getAsync();
    return app.provider.seriesAsync(context, model.url);
  }

  @api.Get('stream')
  @app.ResponseValidator(app.IApiStream)
  @swg.ApiResponse({status: 200, type: app.IApiStream})
  async streamAsync(@api.Query() model: app.RemoteStreamQuery) {
    const context = await this.context.getAsync();
    return app.provider.streamAsync(context, model.url);
  }
}
