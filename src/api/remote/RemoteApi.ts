import * as api from '..';

export class RemoteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/series' + query, this.baseUrl).toString();
    return await api.jsonAsync<api.RemoteSeries>(url);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/stream' + query, this.baseUrl).toString();
    return await api.jsonAsync<api.RemoteStream>(url);
  }
}
