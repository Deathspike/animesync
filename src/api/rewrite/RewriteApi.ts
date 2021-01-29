import * as api from '..';
import fetch from 'node-fetch';
import querystring from 'querystring';

export class RewriteApi {
  private readonly _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  async emulateAsync(model: api.RewriteParamEmulate, headers?: Record<string, string>) {
    const query = querystring.stringify(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.url)}?${query}`, this._baseUrl);
    return await fetch(url);
  }

  async hlsAsync(model: api.RewriteParamHls, headers?: Record<string, string>) {
    const query = querystring.stringify(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.url)}?${query}`, this._baseUrl);
    return await fetch(url);
  }
}
