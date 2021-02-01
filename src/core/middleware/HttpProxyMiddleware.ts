import * as app from '..';
import * as ncm from '@nestjs/common';
import express from 'express';

@ncm.Injectable()
export class HttpProxyMiddleware implements ncm.NestMiddleware {
  private readonly agentService: app.AgentService;
  
  constructor(agentService: app.AgentService) {
    this.agentService = agentService;
  }

  async use(request: express.Request, response: express.Response, next: express.NextFunction) {
    if (request.socket.localAddress !== request.socket.remoteAddress || request.url.startsWith('/')) return next();
    const body = request.body;
    const headers = this.agentService.getHeaders(request.headers);
    const method = request.method;
    await this.agentService.forwardAsync(new URL(request.url), response, {body, headers, method});
  }
}
