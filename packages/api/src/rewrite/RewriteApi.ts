import * as api from '..';
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

  async hlsMasterAsync(model: api.RewriteParamHlsMaster, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/hls/master/${encodeURIComponent(model.masterUrl)}/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }

  async hlsMediaAsync(model: api.RewriteParamHlsMedia, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/hls/media/${encodeURIComponent(model.mediaUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }

  async subtitleAsync(model: api.RewriteParamSubtitle, headers?: Record<string, string>) {
    const query = headers && api.queryString(headers);
    const url = new URL(`/api/rewrite/subtitle/${encodeURIComponent(model.subtitleType)}/${encodeURIComponent(model.subtitleUrl)}` + query, this.baseUrl).toString();
    return await fetch(url);
  }
}
