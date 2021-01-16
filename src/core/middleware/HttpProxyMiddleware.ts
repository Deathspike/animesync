import * as ace from '../..';
import * as ncm from '@nestjs/common';
import express from 'express';

@ncm.Injectable()
export class HttpProxyMiddleware implements ncm.NestMiddleware {
  private readonly _agentService: ace.shr.AgentService;
  
  constructor(agentService: ace.shr.AgentService) {
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
