import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as ncm from '@nestjs/common';
import * as rop from 'rxjs/operators';
import express from 'express';

export class ResponseValidatorInterceptor<T extends object> implements ncm.NestInterceptor {
  private readonly cls: Array<ncm.Type<T>> | ncm.Type<T>;
  private readonly options?: clt.ClassTransformOptions;

  constructor(cls: Array<ncm.Type<T>> | ncm.Type<T>, options?: clt.ClassTransformOptions) {
    this.cls = cls;
    this.options = options;
  }

  intercept(context: ncm.ExecutionContext, next: ncm.CallHandler) {
    return next.handle().pipe(rop.map(async (value: Array<T> | T) => {
      const validationErrors = Array.isArray(this.cls)
        ? await this.arrayAsync(this.cls, value)
        : await this.singleAsync(this.cls, value);
      if (validationErrors.length) {
        const errors = flatten(validationErrors);
        const message = 'Validation failed';
        const response = context.switchToHttp().getResponse<express.Response>();
        const statusCode = 500;
        response.status(statusCode);
        return {statusCode, message, errors, value};
      } else {
        return value;
      }
    }));
  }
  
  private async arrayAsync(cls: Array<ncm.Type<T>>, value: Array<T> | T) {
    if (!Array.isArray(value)) return [{property: '$', constraints: {array: 'Not an array'}, children: []}];
    const validationErrors = await Promise.all(value.map(x => this.singleAsync(cls[0], x)));
    validationErrors.forEach((x, i) => x.forEach(y => y.property = `[${i}].${y.property}`));
    return validationErrors.reduce((p, c) => p.concat(c), [] as Array<clv.ValidationError>);
  }

  private async singleAsync(cls: ncm.Type<T>, value: Array<T> | T) {
    if (Array.isArray(value)) return [{property: '$', constraints: {array: 'Is an array'}, children: []}];
    if (value instanceof cls) return await clv.validate(value);
    return await clv.validate(clt.plainToClass(cls, value, this.options));
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
