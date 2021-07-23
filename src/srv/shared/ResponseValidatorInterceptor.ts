import * as app from '.';
import * as ncm from '@nestjs/common';
import * as rop from 'rxjs/operators';

export class ResponseValidatorInterceptor<T extends object> implements ncm.NestInterceptor {
  private readonly cls: Array<ncm.Type<T>> | ncm.Type<T>;

  constructor(cls: Array<ncm.Type<T>> | ncm.Type<T>) {
    this.cls = cls;
  }

  intercept(_: ncm.ExecutionContext, next: ncm.CallHandler) {
    return next.handle().pipe(rop.map(async (value: Array<T> | T) => {
      await app.ValidationError.validateAsync(this.cls, value);
      return value;
    }));
  }
}
