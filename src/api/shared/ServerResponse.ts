import fetch from 'node-fetch';
type ErrorResult = {message: string};

export class ServerResponse<T> {
  private readonly requiredCode: number;
  private readonly response: fetch.Response;
  private readonly result?: any;

  private constructor(requiredCode: number, response: fetch.Response, result?: any) {
    this.requiredCode = requiredCode;
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
    return this.success ? undefined : this.result as ErrorResult;
  }

  get statusCode() {
    return this.response.status;
  }

  get success() {
    return this.response.status === this.requiredCode;
  }

  get value() {
    return this.success ? this.result as T : undefined;
  }
}
