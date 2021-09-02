import * as api from '..';

export class SettingApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async coreAsync() {
    const url = new URL('/api/setting', this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.SettingCore>(url);
  }

  async corePutAsync(model: api.SettingCore) {
    const options = api.ServerResponse.options('PUT', model);
    const url = new URL('/api/setting', this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async credentialAsync() {
    const url = new URL('/api/setting/credential', this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.SettingCredential>(url);
  }

  async credentialPutAsync(model: api.SettingCredential) {
    const options = api.ServerResponse.options('PUT', model);
    const url = new URL('/api/setting/credential', this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }

  async pathAsync() {
    const url = new URL('/api/setting/path', this.baseUrl).toString();
    return await api.ServerResponse.jsonAsync<api.SettingPath>(url);
  }

  async pathPutAsync(model: api.SettingPath) {
    const options = api.ServerResponse.options('PUT', model);
    const url = new URL('/api/setting/path', this.baseUrl).toString();
    return await api.ServerResponse.emptyAsync(url, options);
  }
}
