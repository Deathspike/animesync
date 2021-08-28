import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class RemoteService {
  private readonly contextService: app.ContextService;

  constructor(contextService: app.ContextService) {
    this.contextService = contextService;
  }

  async seriesAsync(model: app.api.RemoteQuerySeries) {
    const api = new app.api.ServerApi(this.contextService.serverUrl);
    return await api.remote.seriesAsync(model);
  }
  
  async streamAsync(model: app.api.RemoteQueryStream) {
    const api = new app.api.ServerApi(this.contextService.serverUrl);
    return await api.remote.streamAsync(model);
  }
}
