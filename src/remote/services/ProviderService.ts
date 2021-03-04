import * as app from '..';
import * as ncm from '@nestjs/common';
import * as ncr from '@nestjs/core';
import {Crunchyroll} from './crunchyroll/Crunchyroll';
import {Funimation} from './funimation/Funimation';

@ncm.Injectable()
export class ProviderService {
  private readonly moduleRef: ncr.ModuleRef;

  constructor(moduleRef: ncr.ModuleRef) {
    this.moduleRef = moduleRef;
  }

  async contextAsync() {
    const providers = await this.providersAsync();
    const contexts = providers.map(p => p.contextAsync());
    return await Promise.all(contexts);
  }

  async pageAsync(id: string, page?: string, options?: Array<string>, pageNumber = 1) {
    const provider = await this.findAsync(x => x.contextAsync(), x => x.id === id);
    if (provider) return await provider.pageAsync(page, options, pageNumber);
    throw new ncm.NotFoundException();
  }

  async searchAsync(id: string, query: string, pageNumber?: number) {
    const provider = await this.findAsync(x => x.contextAsync(), x => x.id === id);
    if (provider) return await provider.searchAsync(query, pageNumber);
    throw new ncm.NotFoundException();
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
  
  private async findAsync<T>(getAsync: (provider: app.IProvider) => Promise<T>, validate?: (item: T) => boolean) {
    const providers = await this.providersAsync();
    const results = await Promise.all(providers.map(x => getAsync(x).then(y => ({provider: x, result: y}))));
    const result = results.find(x => validate ? validate(x.result) : x.result);
    return result?.provider;
  }

  private async providersAsync(): Promise<Array<app.IProvider>> {
    const crunchyroll = this.moduleRef.create(Crunchyroll);
    const funimation = this.moduleRef.create(Funimation);
    return await Promise.all([crunchyroll, funimation]);
  }
}
