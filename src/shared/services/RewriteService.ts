import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import express from 'express';
import querystring from 'querystring';

@ncm.Injectable()
export class RewriteService {
  private readonly baseUrl: URL;

  constructor(@ncm.Inject(ncr.REQUEST) request: express.Request) {
    const host = request.headers['host'] ?? request.hostname;
    const protocol = request.headers['x-forwarded-proto'] ?? request.protocol;
    this.baseUrl = new URL(`${protocol}://${host}/`);
  }

  emulateUrl(emulateUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeEmulateUrl = encodeURIComponent(new URL(relativeUrl, emulateUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/${safeEmulateUrl}?${safeQuery}`, this.baseUrl).toString();
  }

  masterUrl(masterUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeMasterUrl = encodeURIComponent(masterUrl);
    const safeMediaUrl = encodeURIComponent(new URL(relativeUrl, masterUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/master/${safeMasterUrl}/${safeMediaUrl}?${safeQuery}`, this.baseUrl).toString();
  }

  mediaUrl(masterOrMediaUrl: string, relativeUrl: string, headers?: Record<string, string>) {
    const safeMediaUrl = encodeURIComponent(new URL(relativeUrl, masterOrMediaUrl).toString());
    const safeQuery = querystring.stringify(headers);
    return new URL(`/api/rewrite/media/${safeMediaUrl}?${safeQuery}`, this.baseUrl).toString();
  }
}
