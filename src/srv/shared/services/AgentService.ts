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
  private readonly loggerService: app.LoggerService;
  
  constructor(contextService: app.ContextService, loggerService: app.LoggerService) {
    this.httpAgent = new app.AgentHttp(contextService, {keepAlive: true});
    this.httpsAgent = new app.AgentHttps(contextService, {keepAlive: true});
    this.loggerService = loggerService;
  }

  async fetchAsync(url: URL, options?: fch.RequestInit) {
    for (let i = 0; ; i++) {
      try {
        const agent = url.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
        const headers = Object.assign(this.getHeaders(options && options.headers ? options.headers : {}), {host: url.host});
        const result = await fetch(url, {...options, agent, headers, signal: createSignal()});
        if (result.status >= 200 && result.status < 300) return await result.buffer();
        throw new Error(`Unexpected status: ${result.status}`);
      } catch (error) {
        if (i >= app.settings.core.fetchMaximumRetries) throw error;
        this.loggerService.debug(error);
        await new Promise<void>((resolve) => setTimeout(resolve, app.settings.core.fetchTimeoutRetry));
      }
    }
  }

  async proxyAsync(url: URL, response: express.Response, options?: fch.RequestInit) {
    const agent = url.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
    const compress = false;
    const redirect = 'manual';
    const result = await fetch(url, {...options, agent, compress, redirect});
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
}

function createSignal() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), app.settings.core.fetchTimeoutRequest);
  return controller.signal;
}

function isIterable(object: unknown): object is Iterable<unknown> {
  if (typeof object !== 'object' || object === null) return false; 
  const safeObject: {[Symbol.iterator]?: unknown} = object;
  return typeof safeObject[Symbol.iterator] === 'function'; 
}
