import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import express from 'express';

@ncm.Injectable()
export class RewriteService {
  private readonly baseUrl: string;

  constructor(@ncm.Inject(ncr.REQUEST) request: express.Request) {
    const host = request.headers['host'] ?? request.hostname;
    const protocol = request.headers['x-forwarded-proto'] ?? request.protocol;
    this.baseUrl = `${protocol}://${host}/`;
  }

  emulateUrl(baseUrl: string, emulateUrl: string, headers?: Record<string, string>) {
    const safeEmulateUrl = encodeURIComponent(new URL(emulateUrl, baseUrl).toString());
    const safeQuery = headers && app.api.queryString(headers);
    return new URL(`/api/rewrite/${safeEmulateUrl}` + safeQuery, this.baseUrl).toString();
  }

  hlsMasterUrl(baseUrl: string, mediaUrl: string, headers?: Record<string, string>) {
    const safeMasterUrl = encodeURIComponent(baseUrl);
    const safeMediaUrl = encodeURIComponent(new URL(mediaUrl, baseUrl).toString());
    const safeQuery = headers && app.api.queryString(headers);
    return new URL(`/api/rewrite/hls/master/${safeMasterUrl}/${safeMediaUrl}` + safeQuery, this.baseUrl).toString();
  }

  hlsMediaUrl(baseUrl: string, mediaUrl: string, headers?: Record<string, string>) {
    const safeMediaUrl = encodeURIComponent(new URL(mediaUrl, baseUrl).toString());
    const safeQuery = headers && app.api.queryString(headers);
    return new URL(`/api/rewrite/hls/media/${safeMediaUrl}` + safeQuery, this.baseUrl).toString();
  }

  subtitleUrl(baseUrl: string, subtitleType: app.api.RewriteParamSubtitle['subtitleType'], subtitleUrl: string, headers?: Record<string, string>) {
    const safeSubtitleType = encodeURIComponent(subtitleType);
    const safeSubtitleUrl = encodeURIComponent(new URL(subtitleUrl, baseUrl).toString());
    const safeQuery = headers && app.api.queryString(headers);
    return new URL(`/api/rewrite/subtitle/${safeSubtitleType}/${safeSubtitleUrl}` + safeQuery, this.baseUrl).toString();
  }
}
