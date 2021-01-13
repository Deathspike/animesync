import * as app from '.';

export class ServerApi {
  constructor(baseUrl: string) {
    this.remote = new app.RemoteApi(baseUrl);
  }

  readonly remote: app.RemoteApi;
}
