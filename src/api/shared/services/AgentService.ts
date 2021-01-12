import * as app from '..';
import * as api from '@nestjs/common';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {HeadersInit, RequestInit} from 'node-fetch';
import fetch from 'node-fetch';
import http from 'http';
import express from 'express';
import url from 'url';

@api.Injectable()
export class AgentService {
  async fetchAsync(requestUrl: string, options?: RequestInit) {
    const agent = new HttpsProxyAgent(app.settings.serverUrl) as any;
    const headers = this.getHeaders(options && options.headers ? options.headers : {});
    const host = url.parse(requestUrl)?.host;
    headers['host'] = host ?? '';
    return await fetch(requestUrl, {...options, agent, headers});
  }

  async forwardAsync(requestUrl: string, options: RequestInit & {headers: http.IncomingHttpHeaders}, response: express.Response) {
    const compress = false;
    const redirect = 'manual';
    const result = await this.fetchAsync(requestUrl, {...options, compress, redirect});
    response.status(result.status);
    Object.entries(this.getHeaders(result.headers)).forEach(([k, v]) => response.header(k, v));
    result.body.pipe(response);
  }

  getHeaders(headers: HeadersInit | http.IncomingHttpHeaders) {
    const result: Record<string, string> = {};
    if (!isIterable(headers)) Object.entries(headers).forEach(([k, v]) => result[k] = Array.isArray(v) ? v.join(',') : v ?? '');
    else if (!Array.isArray(headers)) Array.from(headers).forEach(([k, v]) => result[k] = v);
    else headers.forEach(([k, v]) => result[k] = v);
    return result;
  }
}

function isIterable(object: unknown): object is Iterable<unknown> {
  if (typeof object !== 'object' || object === null) return false; 
  const safeObject: {[Symbol.iterator]?: unknown} = object;
  return typeof safeObject[Symbol.iterator] === 'function'; 
}
