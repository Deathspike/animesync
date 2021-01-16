import * as acm from '.';
import * as ncm from '@nestjs/common';
import * as rop from 'rxjs/operators';
import express from 'express';

@ncm.Injectable()
export class ResponseLoggerInterceptor<T> implements ncm.NestInterceptor {
  private readonly _loggerService: acm.LoggerService;

  constructor(loggerService: acm.LoggerService) {
    this._loggerService = loggerService;
  }

  intercept(context: ncm.ExecutionContext, next: ncm.CallHandler) {
    this._traceRequest(context);
    return next.handle().pipe(rop.map((value: T) => {
      if (value instanceof Promise) {
        value.then((value) => this._traceResponse(context, value));
        return value;
      } else {
        this._traceResponse(context, value);
        return value;
      }
    }));
  }

  private _traceRequest(context: ncm.ExecutionContext) {
    const request: express.Request = context.switchToHttp().getRequest();
    this._loggerService.debug(`HTTP/${request.httpVersion} ${request.method} ${request.url}`);
  }

  private _traceResponse<T>(context: ncm.ExecutionContext, value: T) {
    const request: express.Request = context.switchToHttp().getRequest();
    const response: express.Response = context.switchToHttp().getResponse();
    this._loggerService.debug(`HTTP/${request.httpVersion} ${response.statusCode} ${JSON.stringify(value)}`);
  }
}
