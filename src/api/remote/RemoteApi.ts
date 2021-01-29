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
    return await fetchJsonAsync<api.RemoteSearch>(url);
  }

  async seriesAsync(model: api.RemoteQuerySeries) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/series?${query}`, this._baseUrl);
    return await fetchJsonAsync<api.RemoteSeries>(url);
  }

  async streamAsync(model: api.RemoteQueryStream) {
    const query = querystring.stringify(model as any);
    const url = new URL(`/api/remote/stream?${query}`, this._baseUrl);
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
