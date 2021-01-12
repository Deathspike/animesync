import * as app from '.';
import * as api from '@nestjs/common';
import * as clt from 'class-transformer';

export function ResponseValidator<T>(cls: {new (...args: any[]): T}, options?: clt.ClassTransformOptions) {
  return api.UseInterceptors(new app.ResponseValidatorInterceptor(cls, options));
}
