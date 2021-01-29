import * as api from '..';
import fetch from 'node-fetch';
import querystring from 'querystring';

export class RemoteApi {
  private readonly _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  async popularAsync(model: api.RemoteQueryPopular) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/popular?${query}`, this._baseUrl);
    return await fetchJsonAsync<api.RemoteSearch>(url, 200);
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/series?${query}`, this._baseUrl);
    return await fetchJsonAsync<api.RemoteSeries>(url, 200);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/stream?${query}`, this._baseUrl);
    return await fetchJsonAsync<api.RemoteStream>(url, 200);
  }
}

async function fetchJsonAsync<T>(url: URL, ...status: Array<number>) {
  const response = await fetch(url);
  if (status.includes(response.status)) {
    const value: T = await response.json();
    return Object.assign(response, {value});
  } else {
    const value = undefined;
    return Object.assign(response, {value});
  }
}
