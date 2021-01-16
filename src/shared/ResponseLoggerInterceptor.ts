import * as api from '@nestjs/common';
import * as apx from '.';
import * as rxo from 'rxjs/operators';
import express from 'express';

@api.Injectable()
export class ResponseLoggerInterceptor<T> implements api.NestInterceptor {
  private readonly _loggerService: apx.LoggerService;

  constructor(loggerService: apx.LoggerService) {
    this._loggerService = loggerService;
  }

  intercept(context: api.ExecutionContext, next: api.CallHandler) {
    this._traceRequest(context);
    return next.handle().pipe(rxo.map((value: T) => {
      if (value instanceof Promise) {
        value.then((value) => this._traceResponse(context, value));
        return value;
      } else {
        this._traceResponse(context, value);
        return value;
      }
    }));
  }

  private _traceRequest(context: api.ExecutionContext) {
    const request: express.Request = context.switchToHttp().getRequest();
    this._loggerService.debug(`HTTP/${request.httpVersion} ${request.method} ${request.url}`);
  }

  private _traceResponse<T>(context: api.ExecutionContext, value: T) {
    const request: express.Request = context.switchToHttp().getRequest();
    const response: express.Response = context.switchToHttp().getResponse();
    this._loggerService.debug(`HTTP/${request.httpVersion} ${response.statusCode} ${JSON.stringify(value)}`);
  }
}
