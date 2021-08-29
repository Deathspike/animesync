import fetch from 'node-fetch';

export class ServerResponse<T> {
  private readonly expected: number;
  private readonly response: fetch.Response;
  private readonly result?: any;

  private constructor(expected: number, response: fetch.Response, result?: any) {
    this.expected = expected;
    this.response = response;
    this.result = result;
  }

  static async emptyAsync(url: string, options?: fetch.RequestInit) {
    const response = await fetch(url, options);
    return new ServerResponse<void>(204, response);
  }

  static async jsonAsync<T>(url: string, options?: fetch.RequestInit) {
    const response = await fetch(url, options);
    const result = await response.json();
    return new ServerResponse<T>(200, response, result);
  }

  static options(verb: string, model?: any) {
    const body = model && JSON.stringify(model);
    const headers = body && {'Content-Type': 'application/json'};
    const method = verb ?? 'GET';
    return {body, headers, method} as fetch.RequestInit;
  }

  get error() {
    if (this.statusCode === this.expected) return undefined;
    return this.result as {message: string};
  }

  get statusCode() {
    return this.response.status;
  }

  get value() {
    if (this.statusCode !== this.expected) return undefined;
    return this.result as T;
  }
}
