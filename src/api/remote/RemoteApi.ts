import * as api from '..';

export class RemoteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async contextAsync(model: api.RemoteQueryContext) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote' + query, this.baseUrl);
    return await api.jsonAsync<Array<api.RemoteProvider>>(url);
  }

  async pageAsync(model: api.RemoteQueryPage) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/page' + query, this.baseUrl);
    return await api.jsonAsync<api.RemoteSearch>(url);
  }

  async searchAsync(model: api.RemoteQuerySearch) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/search' + query, this.baseUrl);
    return await api.jsonAsync<api.RemoteSearch>(url);
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/series' + query, this.baseUrl);
    return await api.jsonAsync<api.RemoteSeries>(url);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = api.queryString(api.unsafe(model));
    const url = new URL('/api/remote/stream' + query, this.baseUrl);
    return await api.jsonAsync<api.RemoteStream>(url);
  }
}
