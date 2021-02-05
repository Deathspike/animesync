import * as api from '..';
import querystring from 'querystring';

export class RemoteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async contextAsync() {
    const url = new URL('/api/remote', this.baseUrl);
    return await api.jsonAsync<api.RemoteProvider>(url);
  }

  async pageAsync(model: api.RemoteQueryPage) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/page?${query}`, this.baseUrl);
    return await api.jsonAsync<api.RemoteSearch>(url);
  }

  async searchAsync(model: api.RemoteQuerySearch) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/search?${query}`, this.baseUrl);
    return await api.jsonAsync<api.RemoteSearch>(url);
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/series?${query}`, this.baseUrl);
    return await api.jsonAsync<api.RemoteSeries>(url);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/stream?${query}`, this.baseUrl);
    return await api.jsonAsync<api.RemoteStream>(url);
  }
}

