import fetch from 'node-fetch';
import url from 'url';

export class NordVpn {
  private isBusy?: boolean;
  private previousServer?: url.UrlWithStringQuery;
  private refreshTime: number;
  private url?: Promise<url.UrlWithStringQuery>;

  constructor() {
    this.refreshTime = 0;
  }

  async getAsync(server: url.UrlWithStringQuery) {
    if ((this.previousServer && this.previousServer.toString() !== server.toString()) || this.refreshTime < Date.now() || !this.url) {
      return await this.tryUpdateAsync(server);
    } else {
      return await this.url;
    }
  }

  private async fetchAsync(server: url.UrlWithStringQuery) {
    const allServers = await fetch('https://nordvpn.com/api/server')
      .then(x => x.json())
      .then(x => x as Array<INordVPN>);
    const filteredServers = allServers
      .filter(x => x.features.proxy_ssl_cybersec)
      .filter(x => x.flag.toLowerCase() === String(server.host).toLowerCase());
    const bestServer = filteredServers
      .sort((a, b) => a.load - b.load)
      .shift();
    if (bestServer && server.auth) {
      return url.parse(`https://${server.auth}@${bestServer.domain}:89/`);
    } else if (bestServer) {
      return url.parse(`https://${bestServer.domain}:89/`);
    } else {
      throw new Error();
    }
  }

  private async tryUpdateAsync(server: url.UrlWithStringQuery) {
    try {
      if (this.isBusy && this.url) return await this.url;
      this.isBusy = true;
      this.previousServer = server;
      this.refreshTime = Date.now() + 20 * 60000;
      this.url = this.fetchAsync(server);
      return await this.url;
    } catch (err) {
      this.refreshTime = 0;
      throw err;
    } finally {
      this.isBusy = false;
    }
  }
}

type INordVPN = {
  domain: string;
  features: {proxy_ssl_cybersec: boolean};
  flag: string;
  load: number;
};
