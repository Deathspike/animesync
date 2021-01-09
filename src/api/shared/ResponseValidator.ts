import * as app from '.';
import * as api from '@nestjs/common';

export function ResponseValidator<T>(responseType: {new (...args: any[]): T}) {
  return api.UseInterceptors(new app.ResponseValidatorInterceptor(responseType));
}
