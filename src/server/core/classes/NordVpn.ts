import * as app from '..';
import fetch from 'node-fetch';
import url from 'url';

export class NordVpn {
  private _isBusy?: boolean;
  private _previousServer?: url.UrlWithStringQuery;
  private _refreshTime: number;
  private _url?: Promise<url.UrlWithStringQuery>;

  constructor() {
    this._refreshTime = 0;
  }

  async getAsync(server: url.UrlWithStringQuery) {
    if ((this._previousServer && this._previousServer.toString() !== server.toString()) || this._refreshTime < Date.now() || !this._url) {
      return await this._tryUpdateAsync(server);
    } else {
      return await this._url;
    }
  }

  private async _fetchAsync(server: url.UrlWithStringQuery) {
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

  private async _tryUpdateAsync(server: url.UrlWithStringQuery) {
    try {
      if (this._isBusy && this._url) return await this._url;
      this._isBusy = true;
      this._previousServer = server;
      this._refreshTime = Date.now() + 20 * 60000;
      this._url = this._fetchAsync(server);
      return await this._url;
    } catch (err) {
      app.logger.debug(err);
      this._refreshTime = 0;
      throw err;
    } finally {
      this._isBusy = false;
    }
  }
}

type INordVPN = {
  domain: string;
  features: {proxy_ssl_cybersec: boolean};
  flag: string;
  load: number;
};
