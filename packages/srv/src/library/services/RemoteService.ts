import * as app from '..';
import * as ncm from '@nestjs/common';

@ncm.Injectable()
export class RemoteService {
  async seriesAsync(model: app.api.RemoteQuerySeries) {
    const api = new app.api.ServerApi(app.settings.server.url);
    return await api.remote.seriesAsync(model);
  }
  
  async streamAsync(model: app.api.RemoteQueryStream) {
    const api = new app.api.ServerApi(app.settings.server.url);
    return await api.remote.streamAsync(model);
  }
}
