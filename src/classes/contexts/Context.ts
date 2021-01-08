import * as app from '../..';
import express from 'express';
import http from 'http';

export class Context {
  private readonly _http: http.Server;
  private readonly _rewrite: app.Rewrite;
  private readonly _tunnel: app.Tunnel;

  private constructor() {
    const server = express().disable('x-powered-by');
    this._http = http.createServer(server);
    this._rewrite = new app.Rewrite(this, server);
    this._tunnel = new app.Tunnel(this._http);
  }
  
  static async usingAsync(handlerAsync: (context: Context) => Promise<void>) {
    const context = new Context();
    await context.startAsync();
    await handlerAsync(context).finally(() => context.disposeAsync());
  }

  get address() {
    const result = this._http.address();
    if (typeof result === 'string') {
      return result;
    } else if (result) {
      return `http://${result.address}:${result.port}/`;
    } else {
      throw new Error();
    }
  }

  get rewrite() {
    return this._rewrite;
  }

  get tunnel() {
    return this._tunnel;
  }

  async disposeAsync() {
    const future = new app.Future<void>();
    this._http.close(() => future.resolve());
    return await future.getAsync();
  }
 
  async startAsync() {
    const future = new app.Future<Context>();
    this._http.on('error', (error) => future.reject(error));
    this._http.listen(0, '127.0.0.1', () => future.resolve(this));
    return await future.getAsync();
  }
}
