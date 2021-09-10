import * as app from '..';
import * as ncm from '@nestjs/common';
import * as fch from 'node-fetch';
import {AbortController} from 'abort-controller';
import fetch from 'node-fetch';
import express from 'express';

@ncm.Injectable()
export class AgentService implements ncm.OnModuleDestroy {
  private readonly httpAgent: app.AgentHttp;
  private readonly httpsAgent: app.AgentHttps;
  private readonly loggerService: app.LoggerService;
  private readonly timeoutHandles: Record<number, AbortController>;

  constructor(loggerService: app.LoggerService) {
    this.httpAgent = new app.AgentHttp({keepAlive: true});
    this.httpsAgent = new app.AgentHttps({keepAlive: true});
    this.loggerService = loggerService;
    this.timeoutHandles = {};
  }

  async emulateAsync(url: string, response: express.Response, options?: fch.RequestInit) {
    return await this.retryAsync(async () => {
      const result = await this.requestAsync(url, {...options, compress: false, redirect: 'manual'});
      const buffer = await result.buffer();
      response.status(result.status);
      Array.from(result.headers.entries()).forEach(([k, v]) => k !== 'transfer-encoding' && response.setHeader(k, v));
      response.send(buffer);
    });
  }

  async fetchAsync(url: string, options?: fch.RequestInit) {
    return await this.retryAsync(async () => {
      const result = await this.requestAsync(url, options);
      const buffer = await result.buffer();
      if (result.status === 200) return buffer;
      throw new Error(`Unexpected status: ${result.status}`);
    });
  }
  
  onModuleDestroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
    Object.keys(this.timeoutHandles).forEach(x => this.expireRequest(Number(x)));
  }

  private expireRequest(timeout: number) {
    if (!this.timeoutHandles[timeout]) return;
    this.timeoutHandles[timeout].abort();
    clearTimeout(timeout);
    delete this.timeoutHandles[timeout];
  }

  private async requestAsync(url: string, options?: fch.RequestInit) {
    const agent = /^https:/i.test(url) ? this.httpsAgent : this.httpAgent;
    const controller = new AbortController();
    const headers = Object.assign(options && options.headers ? options.headers : {}, {host: new URL(url).host});
    const timeout: number = +setTimeout(() => this.expireRequest(timeout), app.settings.core.fetchTimeoutRequest);
    this.timeoutHandles[timeout] = controller;
    return await fetch(url, app.api.unsafe({...options, agent, headers, insecureHTTPParser: true, signal: controller.signal}));
  }

  private async retryAsync<T>(handlerAsync: () => Promise<T>) {
    for (let i = 0; ; i++) try {
      return await handlerAsync();
    } catch (error) {
      if (i >= app.settings.core.fetchMaximumRetries) throw error;
      this.loggerService.debug(error as any);
      await new Promise<void>((resolve) => setTimeout(resolve, app.settings.core.fetchTimeoutRetry));
    }
  }
}
