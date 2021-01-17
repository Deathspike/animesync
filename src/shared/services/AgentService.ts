import * as acm from '..';
import * as ncm from '@nestjs/common';
import * as fch from 'node-fetch';
import fetch from 'node-fetch';
import http from 'http';
import express from 'express';

@ncm.Injectable()
export class AgentService implements ncm.OnModuleDestroy {
  private readonly _httpAgent: acm.AgentHttp;
  private readonly _httpsAgent: acm.AgentHttps;
  
  constructor() {
    this._httpAgent = new acm.AgentHttp({keepAlive: true});
    this._httpsAgent = new acm.AgentHttps({keepAlive: true});
  }

  async fetchAsync(url: URL, options?: fch.RequestInit) {
    const agent = url.protocol === 'https:' ? this._httpsAgent : this._httpAgent;
    const headers = this.getHeaders(options && options.headers ? options.headers : {});
    headers['host'] = url.host ?? '';
    return await fetch(url, {...options, agent, headers});
  }

  async forwardAsync(url: URL, response: express.Response, options?: fch.RequestInit) {
    const compress = false;
    const redirect = 'manual';
    const result = await this.fetchAsync(url, {...options, compress, redirect});
    response.status(result.status);
    Object.entries(this.getHeaders(result.headers)).forEach(([k, v]) => response.header(k, v));
    result.body.pipe(response);
  }

  getHeaders(headers: fch.HeadersInit | http.IncomingHttpHeaders) {
    const result: Record<string, string> = {};
    if (!isIterable(headers)) Object.entries(headers).forEach(([k, v]) => result[k] = Array.isArray(v) ? v.join(',') : v ?? '');
    else if (!Array.isArray(headers)) Array.from(headers).forEach(([k, v]) => result[k] = v);
    else headers.forEach(([k, v]) => result[k] = v);
    return result;
  }
  
  onModuleDestroy() {
    this._httpAgent.destroy();
    this._httpsAgent.destroy();
  }
}

function isIterable(object: unknown): object is Iterable<unknown> {
  if (typeof object !== 'object' || object === null) return false; 
  const safeObject: {[Symbol.iterator]?: unknown} = object;
  return typeof safeObject[Symbol.iterator] === 'function'; 
}
