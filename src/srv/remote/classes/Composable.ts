import * as app from '..';

export class Composable<T> implements app.IComposable<T> {
  constructor(url: string, value: T, headers?: Record<string, string>) {
    this.headers = headers;
    this.url = url;
    this.value = value;
  }

  readonly headers?: Record<string, string>;
  readonly url: string;
  readonly value: T;
}
