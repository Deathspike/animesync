import * as app from '../..';
import * as ncm from '@nestjs/common';
import {evaluatePage} from './evaluators/page';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeriesAsync} from './evaluators/series';
import {evaluateStreamAsync} from './evaluators/stream';
import {FunimationContext} from './FunimationContext';
import {FunimationCredential} from './FunimationCredential';
import {FunimationRegion} from './FunimationRegion';
import querystring from 'querystring';
const baseUrl = 'https://www.funimation.com';

@ncm.Injectable()
export class Funimation implements app.IProvider {
  private readonly browserService: app.BrowserService;

  constructor(browserService: app.BrowserService) {
    this.browserService = browserService;
  }

  contextAsync() {
    const id = 'funimation';
    const label = 'Funimation';
    const pages = FunimationContext.pages();
    return Promise.resolve(new app.api.RemoteProvider({id, label, pages}));
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/[^\/]+\/$/.test(streamUrl);
    return Promise.resolve(isStream);
  }

  async pageAsync(page?: string, options?: Array<string>, pageNumber = 1) {
    const pageSource = FunimationContext.findPage(page);
    const pageUrl = createPageUrl(pageSource, options, pageNumber).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(pageUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = FunimationRegion.search(await page.evaluate(evaluatePage));
      return new app.Composable(pageUrl, search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    const searchRaw = querystring.stringify({categoryType: 'Series', q: query});
    const searchUrl = new URL(`/search/${pageNumber}/?${searchRaw}`, baseUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(searchUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = FunimationRegion.search(await page.evaluate(evaluateSearch));
      return new app.Composable(searchUrl, search, headers);
    });
  }

  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, seriesUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = FunimationRegion.series(await page.evaluate(evaluateSeriesAsync));
      return new app.Composable(seriesUrl, series, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, streamUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStreamAsync);
      return new app.Composable(streamUrl, stream, headers);
    });
  }
}

function createPageUrl(page?: app.api.RemoteProviderPage, options?: Array<string>, pageNumber = 1) {
  const index = 'catalog-shows';
  const sort = 'latestAvail|desc';
  const f = ['language|Japanese'].concat(options && options.length && options.every(x => page?.options.find(y => x === y.id)) ? options.map(x => `genre|${x}`) : []);
  const lang = 'Japanese';
  const limit = 25;
  const offset = (pageNumber - 1) * 25;
  return new URL(`/v1/search?${querystring.stringify({index, sort, f, lang, limit, offset,})}`, 'https://search.prd.funimationsvc.com');
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
