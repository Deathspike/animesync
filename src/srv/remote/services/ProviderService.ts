import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import {Crunchyroll} from './crunchyroll/Crunchyroll';
import {Funimation} from './funimation/Funimation';

@ncm.Injectable()
export class ProviderService {
  private readonly moduleRef: ncr.ModuleRef;
  private readonly pluginService: app.PluginService;

  constructor(moduleRef: ncr.ModuleRef, pluginService: app.PluginService) {
    this.moduleRef = moduleRef;
    this.pluginService = pluginService;
  }

  async seriesAsync(seriesUrl: string) {
    return await this.providersAsync(async (providers) => {
      const provider = await this.findAsync(providers, x => x.isSeriesAsync(seriesUrl));
      if (provider) return await provider.seriesAsync(seriesUrl);
      throw new ncm.NotFoundException();
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.providersAsync(async (providers) => {
      const provider = await this.findAsync(providers, x => x.isStreamAsync(streamUrl));
      if (provider) return await provider.streamAsync(streamUrl);
      throw new ncm.NotFoundException();
    });
  }
  
  private async findAsync<T>(providers: Array<app.IProvider>, getAsync: (provider: app.IProvider) => Promise<T>, validate?: (item: T) => boolean) {
    const results = await Promise.all(providers.map(x => getAsync(x).then(y => ({provider: x, result: y}))));
    const result = results.find(x => validate ? validate(x.result) : x.result);
    return result?.provider;
  }

  private async providersAsync<T>(handlerAsync: (providers: Array<app.IProvider>) => Promise<T>) {
    return await this.pluginService.providersAsync(async (externalProviders) => {
      const crunchyroll = this.moduleRef.create(Crunchyroll) as Promise<app.IProvider>;
      const funimation = this.moduleRef.create(Funimation) as Promise<app.IProvider>;
      const providers = await Promise.all([crunchyroll, funimation]);
      return await handlerAsync(providers.concat(externalProviders));
    });
  }
}
