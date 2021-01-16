import * as acm from '.';

export class ServerApi {
  constructor(baseUrl: string) {
    this.remote = new acm.RemoteApi(baseUrl);
    this.rewrite = new acm.RewriteApi(baseUrl);
  }

  readonly remote: acm.RemoteApi;
  readonly rewrite: acm.RewriteApi;
}
