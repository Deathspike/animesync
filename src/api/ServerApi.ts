import * as api from '.';

export class ServerApi {
  constructor(baseUrl: string) {
    this.remote = new api.RemoteApi(baseUrl);
    this.rewrite = new api.RewriteApi(baseUrl);
    this.setting = new api.SettingApi(baseUrl);
  }

  readonly remote: api.RemoteApi;
  readonly rewrite: api.RewriteApi;
  readonly setting: api.SettingApi;
}
