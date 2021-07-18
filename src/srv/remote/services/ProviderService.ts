import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import {Crunchyroll} from './crunchyroll/Crunchyroll';
import {Funimation} from './funimation/Funimation';

@ncm.Injectable()
export class ProviderService {
  private readonly providers: Array<Promise<app.IProvider>>;

  constructor(moduleRef: ncr.ModuleRef) {
    this.providers = [
      moduleRef.create(Crunchyroll),
      moduleRef.create(Funimation)
    ];
  }

  async seriesAsync(seriesUrl: string) {
    const provider = await this.findAsync(x => x.isSeriesAsync(seriesUrl));
    if (provider) return await provider.seriesAsync(seriesUrl);
    throw new ncm.NotFoundException();
  }

  async streamAsync(streamUrl: string) {
    const provider = await this.findAsync(x => x.isStreamAsync(streamUrl));
    if (provider) return await provider.streamAsync(streamUrl);
    throw new ncm.NotFoundException();
  }
  
  private async findAsync<T>(getAsync: (provider: app.IProvider) => Promise<T>) {
    const providers = await Promise.all(this.providers);
    const results = await Promise.all(providers.map(x => getAsync(x).then(y => ({provider: x, result: y}))));
    return results.find(x => x.result)?.provider;
  }
}
