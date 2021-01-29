import * as app from '.';
import * as clt from 'class-transformer';
import * as ncm from '@nestjs/common';

export function ResponseValidator<T>(cls: ncm.Type<T>, options?: clt.ClassTransformOptions) {
  return ncm.UseInterceptors(new app.ResponseValidatorInterceptor(cls, options));
}
