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

  intercept(context: ncm.ExecutionContext, next: ncm.CallHandler) {
    this.traceRequest(context);
    return next.handle().pipe(rop.map((value: T) => {
      if (value instanceof Promise) {
        value.then((value) => this.traceResponse(context, value));
        return value;
      } else {
        this.traceResponse(context, value);
        return value;
      }
    }));
  }

  private traceRequest(context: ncm.ExecutionContext) {
    const request: express.Request = context.switchToHttp().getRequest();
    this.loggerService.debug(`HTTP/${request.httpVersion} ${request.method} ${request.url}`);
  }

  private traceResponse<T>(context: ncm.ExecutionContext, value: T) {
    const request: express.Request = context.switchToHttp().getRequest();
    const response: express.Response = context.switchToHttp().getResponse();
    this.loggerService.debug(`HTTP/${request.httpVersion} ${response.statusCode} ${JSON.stringify(value)}`);
  }
}
