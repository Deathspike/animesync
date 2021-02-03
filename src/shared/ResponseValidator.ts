import * as app from '.';
import * as clt from 'class-transformer';
import * as ncm from '@nestjs/common';

export function ResponseValidator<T>(cls: Array<ncm.Type<T>> | ncm.Type<T>, options?: clt.ClassTransformOptions) {
  return ncm.UseInterceptors(new app.ResponseValidatorInterceptor(cls, options));
}
