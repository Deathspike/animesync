import * as app from '.';

export class ServerApi {
  constructor(baseUrl: string) {
    this.remote = new app.RemoteApi(baseUrl);
    this.rewrite = new app.RewriteApi(baseUrl);
  }

  readonly remote: app.RemoteApi;
  readonly rewrite: app.RewriteApi;
}
