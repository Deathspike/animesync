import * as api from '@nestjs/common';
import * as apx from '.';
import * as clt from 'class-transformer';

export function ResponseValidator<T>(cls: api.Type<T>, options?: clt.ClassTransformOptions) {
  return api.UseInterceptors(new apx.ResponseValidatorInterceptor(cls, options));
}
