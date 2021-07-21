import * as app from '..';
import * as ncm from '@nestjs/common';
import express from 'express';
import http from 'http';

@ncm.Injectable()
export class HttpProxyMiddleware implements ncm.NestMiddleware {
  private readonly agentService: app.AgentService;
  
  constructor(agentService: app.AgentService) {
    this.agentService = agentService;
  }

  async use(request: express.Request, response: express.Response, next: express.NextFunction) {
    if (request.socket.localAddress !== request.socket.remoteAddress || request.url.startsWith('/')) return next();
    const body = request.body;
    const headers = convertHeaders(request.headers);
    const method = request.method;
    await this.agentService.emulateAsync(new URL(request.url), response, {body, headers, method});
  }
}

function convertHeaders(headers: http.IncomingHttpHeaders) {
  const result: Record<string, string> = {};
  Object.entries(headers).forEach(([k, v]) => result[k] = Array.isArray(v) ? v.join(',') : v ?? '');
  return result;
}
