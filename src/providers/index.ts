import * as app from '..';
import {crunchyrollProvider} from './crunchyroll';
import {funimationProvider} from './funimation';

export const provider = {
  async popularAsync(context: app.Context, providerName: app.IApiProviderName, pageNumber?: number) {
    switch (providerName) {
      case 'crunchyroll':
        return await crunchyrollProvider.popularAsync(context, pageNumber);
      case 'funimation':
        return await funimationProvider.popularAsync(context, pageNumber);
      default:
        throw new Error();
    }
  },

  async seriesAsync(context: app.Context, seriesUrl: string) {
    if (crunchyrollProvider.isSupported(seriesUrl)) {
      return await crunchyrollProvider.seriesAsync(context, seriesUrl);
    } else if (funimationProvider.isSupported(seriesUrl)) {
      return await funimationProvider.seriesAsync(context, seriesUrl);
    } else {
      throw new Error();
    }
  },

  async streamAsync(context: app.Context, episodeUrl: string) {
    if (crunchyrollProvider.isSupported(episodeUrl)) {
      return await crunchyrollProvider.streamAsync(context, episodeUrl);
    } else if (funimationProvider.isSupported(episodeUrl)) {
      return await funimationProvider.streamAsync(context, episodeUrl);
    } else {
      throw new Error();
    }
  }
};
