import * as app from '..';
import * as api from '@nestjs/common';
import {HeadersInit, RequestInit} from 'node-fetch';
import fetch from 'node-fetch';
import http from 'http';
import express from 'express';

@api.Injectable()
export class AgentService {
  private readonly _httpAgent: app.AgentHttp;
  private readonly _httpsAgent: app.AgentHttps;
  
  constructor() {
    this._httpAgent = new app.AgentHttp({keepAlive: true});
    this._httpsAgent = new app.AgentHttps({keepAlive: true});
  }

  async fetchAsync(url: URL, options?: RequestInit) {
    const agent = url.protocol === 'https:' ? this._httpsAgent : this._httpAgent;
    const headers = this.getHeaders(options && options.headers ? options.headers : {});
    headers['host'] = url.host ?? '';
    return await fetch(url, {...options, agent, headers});
  }

  async forwardAsync(url: URL, response: express.Response, options?: RequestInit) {
    const compress = false;
    const redirect = 'manual';
    const result = await this.fetchAsync(url, {...options, compress, redirect});
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
