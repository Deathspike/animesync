import * as app from '.';
import fetch from 'node-fetch';
import querystring from 'querystring';

export class RemoteApi {
  private readonly _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  async popularAsync(model: app.RemoteQueryPopular) {
    const query = querystring.stringify(model as any);
    const response = await fetch(new URL(`/api/remote/popular?${query}`, this._baseUrl).toString());
    const statusCode = response.status;
    if (statusCode !== 200) return {statusCode};
    const value: app.RemoteSearch = await response.json();
    return {statusCode, value};
  }

  async seriesAsync(model: app.RemoteQuerySeries) {
    const query = querystring.stringify(model as any);
    const response = await fetch(new URL(`/api/remote/series?${query}`, this._baseUrl).toString());
    const statusCode = response.status;
    if (statusCode !== 200) return {statusCode};
    const value: app.RemoteSeries = await response.json();
    return {statusCode, value};
  }

  async streamAsync(model: app.RemoteQueryStream) {
    const query = querystring.stringify(model as any);
    const response = await fetch(new URL(`/api/remote/stream?${query}`, this._baseUrl).toString());
    const statusCode = response.status;
    if (statusCode !== 200) return {statusCode};
    const value: app.RemoteStream = await response.json();
    return {statusCode, value};
  }
}
