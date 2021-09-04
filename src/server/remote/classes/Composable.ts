import * as app from '..';

export class Composable<T> implements app.IComposable<T> {
  constructor(baseUrl: string, value: T, headers?: Record<string, string>) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.value = value;
  }

  readonly baseUrl: string;
  readonly headers?: Record<string, string>;
  readonly value: T;
}
