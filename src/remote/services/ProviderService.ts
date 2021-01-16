import * as api from '@nestjs/common';
import * as app from '../..';
import * as apx from '..';
import {CrunchyRollProvider} from './crunchyroll';
import {FunimationProvider} from './funimation';

@api.Injectable()
export class ProviderService {
  private readonly _crunchyrollProvider: CrunchyRollProvider;
  private readonly _funimationProvider: FunimationProvider;

  constructor(browserService: app.shared.BrowserService, composeService: apx.ComposeService) {
    this._crunchyrollProvider = new CrunchyRollProvider(browserService, composeService);
    this._funimationProvider = new FunimationProvider(browserService, composeService);
  }

  async popularAsync(providerName: string, pageNumber?: number) {
    switch (providerName) {
      case 'crunchyroll':
        return await this._crunchyrollProvider.popularAsync(pageNumber);
      case 'funimation':
        return await this._funimationProvider.popularAsync(pageNumber);
      default:
        throw new Error();
    }
  }

  async seriesAsync(seriesUrl: string) {
    if (this._crunchyrollProvider.isSupported(seriesUrl)) {
      return await this._crunchyrollProvider.seriesAsync(seriesUrl);
    } else if (this._funimationProvider.isSupported(seriesUrl)) {
      return await this._funimationProvider.seriesAsync(seriesUrl);
    } else {
      throw new Error();
    }
  }

  async streamAsync(episodeUrl: string) {
    if (this._crunchyrollProvider.isSupported(episodeUrl)) {
      return await this._crunchyrollProvider.streamAsync(episodeUrl);
    } else if (this._funimationProvider.isSupported(episodeUrl)) {
      return await this._funimationProvider.streamAsync(episodeUrl);
    } else {
      throw new Error();
    }
  }
}
