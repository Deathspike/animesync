import * as app from '..';
import * as api from '@nestjs/common';
import express from 'express';

@api.Injectable()
export class HttpProxyMiddleware implements api.NestMiddleware {
  private readonly _agentService: app.AgentService;
  
  constructor(agentService: app.AgentService) {
    this._agentService = agentService;
  }

  async use(request: express.Request, response: express.Response, next: express.NextFunction) {
    if (request.socket.localAddress !== request.socket.remoteAddress || request.url.startsWith('/')) return next();
    const body = request.body;
    const headers = this._agentService.getHeaders(request.headers);
    const method = request.method;
    await this._agentService.forwardAsync(new URL(request.url), response, {body, headers, method});
  }
}
