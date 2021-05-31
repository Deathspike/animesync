import * as api from '..';
import fetch from 'node-fetch';

export class RewriteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async emulateAsync(model: api.RewriteParamEmulate, headers?: Record<string, string>) {
    const query = api.queryString(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.emulateUrl)}` + query, this.baseUrl);
    return await fetch(url);
  }

  async masterAsync(model: api.RewriteParamMaster, headers?: Record<string, string>) {
    const query = api.queryString(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.masterUrl)}/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl);
    return await fetch(url);
  }

  async mediaAsync(model: api.RewriteParamMedia, headers?: Record<string, string>) {
    const query = api.queryString(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl);
    return await fetch(url);
  }
}
