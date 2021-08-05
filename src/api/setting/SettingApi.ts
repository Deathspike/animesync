import * as api from '..';

export class SettingApi {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async coreAsync() {
    const url = new URL('/api/setting', this.baseUrl).toString();
    return await api.jsonAsync<api.SettingCore>(url);
  }

  async credentialAsync() {
    const url = new URL('/api/setting/credential', this.baseUrl).toString();
    return await api.jsonAsync<api.SettingCredential>(url);
  }

  async pathAsync() {
    const url = new URL('/api/setting/path', this.baseUrl).toString();
    return await api.jsonAsync<api.SettingPath>(url);
  }

  async updateCoreAsync(model: api.SettingCore) {
    const body = JSON.stringify(model);
    const headers = {'Content-Type': 'application/json'};
    const method = 'PUT';
    const url = new URL('/api/setting', this.baseUrl).toString();
    return await api.jsonAsync(url, {body, method, headers});
  }

  async updateCredentialAsync(model: api.SettingCredential) {
    const body = JSON.stringify(model);
    const headers = {'Content-Type': 'application/json'};
    const method = 'PUT';
    const url = new URL('/api/setting/credential', this.baseUrl).toString();
    return await api.jsonAsync(url, {body, method, headers});
  }

  async updatePathAsync(model: api.SettingPath) {
    const body = JSON.stringify(model);
    const headers = {'Content-Type': 'application/json'};
    const method = 'PUT';
    const url = new URL('/api/setting/path', this.baseUrl).toString();
    return await api.jsonAsync(url, {body, method, headers});
  }
}
