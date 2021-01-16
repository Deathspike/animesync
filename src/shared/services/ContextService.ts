import * as api from '@nestjs/common';
import {REQUEST} from '@nestjs/core';
import express from 'express';
import querystring from 'querystring';

@api.Injectable()
export class ContextService {
  private readonly _baseUrl: URL;

  constructor(@api.Inject(REQUEST) request: express.Request) {
    const host = request.headers['host'] ?? request.hostname;
    const protocol = request.headers['x-forwarded-proto'] ?? request.protocol;
    this._baseUrl = new URL(`${protocol}://${host}/`);
  }

  emulateUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/api/rewrite/${safeUrl}?${safeQuery}`, this._baseUrl).toString();
  }

  hlsUrl(url: string, headers?: Record<string, string>) {
    const safeQuery = querystring.stringify(headers);
    const safeUrl = encodeURIComponent(url);
    return new URL(`/api/rewrite/hls/${safeUrl}?${safeQuery}`, this._baseUrl).toString();
  }
}
