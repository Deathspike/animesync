import * as api from '.';
import fetch from 'node-fetch';

export class RewriteApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async emulateAsync(model: api.RewriteParamEmulate, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/${encodeURIComponent(model.emulateUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }

  async masterAsync(model: api.RewriteParamMaster, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/master/${encodeURIComponent(model.masterUrl)}/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }

  async mediaAsync(model: api.RewriteParamMedia, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/media/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }
}
