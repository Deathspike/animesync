import fetch from 'node-fetch';

export class NordVpn {
  private isBusy?: boolean;
  private previousServer?: URL;
  private refreshTime: number;
  private url?: Promise<URL>;

  constructor() {
    this.refreshTime = 0;
  }

  async getAsync(server: URL) {
    if ((this.previousServer && this.previousServer.toString() !== server.toString()) || this.refreshTime < Date.now() || !this.url) {
      return await this.tryUpdateAsync(server);
    } else {
      return await this.url;
    }
  }

  private async fetchAsync(server: URL) {
    const allServers = await fetch('https://nordvpn.com/api/server')
      .then(x => x.json())
      .then(x => x as Array<INordVPN>);
    const filteredServers = allServers
      .filter(x => x.features.proxy_ssl_cybersec)
      .filter(x => x.flag.toLowerCase() === String(server.host).toLowerCase());
    const bestServer = filteredServers
      .sort((a, b) => a.load - b.load)
      .shift();
    if (bestServer && server.username) {
      return new URL(`https://${server.username}:${server.password}@${bestServer.domain}:89/`);
    } else if (bestServer) {
      return new URL(`https://${bestServer.domain}:89/`);
    } else {
      throw new Error();
    }
  }

  private async tryUpdateAsync(server: URL) {
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
