import * as api from '.';

export class ServerApi {
  constructor(baseUrl: string) {
    this.remote = new api.RemoteApi(baseUrl);
    this.rewrite = new api.RewriteApi(baseUrl);
  }

  readonly remote: api.RemoteApi;
  readonly rewrite: api.RewriteApi;
}
