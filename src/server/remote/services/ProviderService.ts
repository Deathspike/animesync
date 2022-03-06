import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import {Crunchyroll} from './crunchyroll/Crunchyroll';
import {CrunchyrollBeta} from './crunchyrollBeta/CrunchyrollBeta';

@ncm.Injectable()
export class ProviderService {
  private readonly providers: Array<Promise<app.IProvider>>;
  private readonly supervisor: app.Supervisor;

  constructor(moduleRef: ncr.ModuleRef) {
    this.providers = [moduleRef.create(Crunchyroll), moduleRef.create(CrunchyrollBeta)];
    this.supervisor = new app.Supervisor();
  }

  async seriesAsync(seriesUrl: string) {
    return await this.supervisor.createOrAttachAsync(seriesUrl, async () => {
      const provider = await this.findAsync(x => x.isSeriesAsync(seriesUrl));
      if (provider) return await provider.seriesAsync(seriesUrl);
      throw new ncm.NotFoundException();
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.supervisor.createOrAttachAsync(streamUrl, async () => {
      const provider = await this.findAsync(x => x.isStreamAsync(streamUrl));
      if (provider) return await provider.streamAsync(streamUrl);
      throw new ncm.NotFoundException();
    });
  }
  
  private async findAsync<T>(getAsync: (provider: app.IProvider) => Promise<T>) {
    const providers = await Promise.all(this.providers);
    const results = await Promise.all(providers.map(x => getAsync(x).then(y => ({provider: x, result: y}))));
    return results.find(x => x.result)?.provider;
  }
}
