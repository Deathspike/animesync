import * as app from '..';
import * as ncm from '@nestjs/common';
import {Crunchyroll} from './crunchyroll/Crunchyroll';
import {Funimation} from './funimation/Funimation';

@ncm.Injectable()
export class ProviderService {
  private readonly crunchyrollProvider: Crunchyroll;
  private readonly funimationProvider: Funimation;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this.crunchyrollProvider = new Crunchyroll(browserService, composeService);
    this.funimationProvider = new Funimation(browserService, composeService);
  }

  context() {
    const crunchyroll = this.crunchyrollProvider.context();
    const funimation = this.funimationProvider.context();
    return [crunchyroll, funimation];
  }

  async pageAsync(provider: app.api.RemoteProviderId, page?: string, options?: Array<string>, pageNumber = 1) {
    switch (provider) {
      case app.api.RemoteProviderId.Crunchyroll:
        return await this.crunchyrollProvider.pageAsync(page, options, pageNumber);
      case app.api.RemoteProviderId.Funimation:
        return await this.funimationProvider.pageAsync(page, options, pageNumber);
    }
  }

  async searchAsync(provider: app.api.RemoteProviderId, query: string, pageNumber?: number) {
    switch (provider) {
      case app.api.RemoteProviderId.Crunchyroll:
        return await this.crunchyrollProvider.searchAsync(query, pageNumber);
      case app.api.RemoteProviderId.Funimation:
        return await this.funimationProvider.searchAsync(query, pageNumber);
    }
  }

  async seriesAsync(seriesUrl: string) {
    if (this.crunchyrollProvider.isSupported(seriesUrl)) {
      return await this.crunchyrollProvider.seriesAsync(seriesUrl);
    } else if (this.funimationProvider.isSupported(seriesUrl)) {
      return await this.funimationProvider.seriesAsync(seriesUrl);
    } else {
      throw new Error();
    }
  }

  async streamAsync(episodeUrl: string) {
    if (this.crunchyrollProvider.isSupported(episodeUrl)) {
      return await this.crunchyrollProvider.streamAsync(episodeUrl);
    } else if (this.funimationProvider.isSupported(episodeUrl)) {
      return await this.funimationProvider.streamAsync(episodeUrl);
    } else {
      throw new Error();
    }
  }
}
