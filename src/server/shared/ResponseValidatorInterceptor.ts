import * as app from '.';
import * as api from '@nestjs/common';
import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as rxo from 'rxjs/operators';
import express from 'express';

export class ResponseValidatorInterceptor<T> implements api.NestInterceptor {
  private readonly _cls: {new (...args: any[]): T};
  private readonly _options?: clt.ClassTransformOptions;

  constructor(cls: {new (...args: any[]): T}, options?: clt.ClassTransformOptions) {
    this._cls = cls;
    this._options = options;
  }

  intercept(context: api.ExecutionContext, next: api.CallHandler) {
    return next.handle().pipe(rxo.map(async (value: T) => {
      const validationErrors = await (value instanceof this._cls
        ? clv.validate(value)
        : clv.validate(clt.plainToClass(this._cls, value, this._options)));
      if (validationErrors.length) {
        const errors = flatten(validationErrors);
        const message = 'Validation failed';
        const response = context.switchToHttp().getResponse<express.Response>();
        const statusCode = 500;
        response.status(statusCode);
        return trace(context, statusCode, {statusCode, message, errors});
      } else {
        return trace(context, 200, value);
      }
    }));
  }
}

function flatten(errors: Array<clv.ValidationError>, previousProperty?: string) {
  const result: Array<{constraints: Record<string, string>, property: string}> = [];
  errors.forEach(error => map(error, result, previousProperty));
  return result;
}

function map(error: clv.ValidationError, result: Array<{constraints: Record<string, string>, property: string}>, previousProperty?: string) {
  const property = previousProperty ? `${previousProperty}.${error.property}` : error.property;
  if (error.constraints) result.push(({property, constraints: error.constraints}))
  if (error.children) result.push(...flatten(error.children, property));
}

function trace<T>(context: api.ExecutionContext, statusCode: number, value: T) {
  const request: express.Request = context.switchToHttp().getRequest();
  app.logger.debug(`-> ${request.url}`);
  app.logger.debug(`<- ${statusCode} ${JSON.stringify(value)}`);
  return value;
}
