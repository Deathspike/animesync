import * as api from '@nestjs/common';
import * as clv from 'class-validator';
import * as clt from 'class-transformer';
import * as rxo from 'rxjs/operators';
import express from 'express';

export class ResponseValidatorInterceptor<T> implements api.NestInterceptor {
  constructor(private responseType: {new (...args: any[]): T}) {}

  intercept(context: api.ExecutionContext, next: api.CallHandler) {
    return next.handle().pipe(rxo.map(async (value: T) => {
      const validationResult = await (value instanceof this.responseType
        ? clv.validate(value)
        : clv.validate(clt.plainToClass(this.responseType, value)));
      if (validationResult.length) {
        const errors = validationResult.map(x => ({constraints: x.constraints, property: x.property}));
        const message = 'Response validation failed';
        const response = context.switchToHttp().getResponse<express.Response>();
        response.status(500);
        response.send({message, errors});
        return value;
      } else {
        return value;
      }
    }));
  }
}
