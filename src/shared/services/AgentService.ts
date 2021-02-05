import * as app from '..';
import * as ncm from '@nestjs/common';
import * as fch from 'node-fetch';
import {AbortController} from 'abort-controller';
import fetch from 'node-fetch';
import http from 'http';
import express from 'express';

@ncm.Injectable()
export class AgentService implements ncm.OnModuleDestroy {
  private readonly httpAgent: app.AgentHttp;
  private readonly httpsAgent: app.AgentHttps;
  
  constructor() {
    this.httpAgent = new app.AgentHttp({keepAlive: true});
    this.httpsAgent = new app.AgentHttps({keepAlive: true});
  }

  async fetchAsync(url: URL, options?: fch.RequestInit) {
    const agent = url.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
    const headers = this.getHeaders(options && options.headers ? options.headers : {});
    const signal = this.createSignal();
    headers['host'] = url.host ?? '';
    return await fetch(url, {...options, agent, headers, signal});
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
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
  }
  
  private createSignal() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), app.settings.core.fetchTimeout);
    return controller.signal;
  }
}

function isIterable(object: unknown): object is Iterable<unknown> {
  if (typeof object !== 'object' || object === null) return false; 
  const safeObject: {[Symbol.iterator]?: unknown} = object;
  return typeof safeObject[Symbol.iterator] === 'function'; 
}
