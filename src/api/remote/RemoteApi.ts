import * as api from '..';
import fetch from 'node-fetch';
import querystring from 'querystring';

export class RemoteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async contextAsync() {
    const url = new URL('/api/remote', this.baseUrl);
    return await fetchJsonAsync<api.RemoteProvider>(url);
  }

  async pageAsync(model: api.RemoteQueryPage) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/page?${query}`, this.baseUrl);
    return await fetchJsonAsync<api.RemoteSearch>(url);
  }

  async searchAsync(model: api.RemoteQuerySearch) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/search?${query}`, this.baseUrl);
    return await fetchJsonAsync<api.RemoteSearch>(url);
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/series?${query}`, this.baseUrl);
    return await fetchJsonAsync<api.RemoteSeries>(url);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/stream?${query}`, this.baseUrl);
    return await fetchJsonAsync<api.RemoteStream>(url);
  }
}

async function fetchJsonAsync<T>(url: URL) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const statusCode: 200 = 200;
      const value: T = await response.json();
      return {statusCode, value};
    } else {
      const statusCode = response.status;
      return {statusCode};
    }
  } catch (error) {
    const statusCode = 0;
    return {statusCode};
  }
}
