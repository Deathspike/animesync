import * as app from '.';
import * as ncm from '@nestjs/common';
import * as rop from 'rxjs/operators';
import express from 'express';

@ncm.Injectable()
export class ResponseLoggerInterceptor<T> implements ncm.NestInterceptor {
  private readonly loggerService: app.LoggerService;

  constructor(loggerService: app.LoggerService) {
    this.loggerService = loggerService;
  }

  static forRequest(request: express.Request) {
    return `(${fetchId(request)}) HTTP/${request.httpVersion} ${request.method} ${request.url}`;
  }
  
  static forResponse<T>(request: express.Request, response: express.Response, value?: T) {
    return `(${fetchId(request)}) HTTP/${request.httpVersion} ${response.statusCode} ${JSON.stringify(value)}`;
  }
  
  intercept(context: ncm.ExecutionContext, next: ncm.CallHandler) {
    this.traceRequest(context);
    return next.handle().pipe(rop.map((value: T) => value instanceof Promise
      ? value.then((value) => this.traceResponse(context, value))
      : this.traceResponse(context, value)));
  }

  private traceRequest(context: ncm.ExecutionContext) {
    const request: express.Request = context.switchToHttp().getRequest();
    this.loggerService.debug(ResponseLoggerInterceptor.forRequest(request));
  }

  private traceResponse<T>(context: ncm.ExecutionContext, value: T) {
    const request: express.Request = context.switchToHttp().getRequest();
    const response: express.Response = context.switchToHttp().getResponse();
    this.loggerService.debug(ResponseLoggerInterceptor.forResponse(request, response, value));
    return value;
  }
}

function fetchId(request: express.Request) {
  const requestKey = '__ResponseLoggerRequestId';
  return request.params[requestKey] ??= Date.now().toString(16).substr(-7);
}
