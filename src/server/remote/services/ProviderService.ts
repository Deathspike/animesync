import * as app from '..';
import * as api from '@nestjs/common';
import {CrunchyRollProvider} from './crunchyroll';
import {FunimationProvider} from './funimation';

@api.Injectable()
export class ProviderService {
  private readonly _crunchyrollProvider: CrunchyRollProvider;
  private readonly _funimationProvider: FunimationProvider;

  constructor(composeService: app.ComposeService) {
    this._crunchyrollProvider = new CrunchyRollProvider(composeService);
    this._funimationProvider = new FunimationProvider(composeService);
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
