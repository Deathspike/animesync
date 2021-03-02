import * as app from '../..';
import {evaluatePage} from './evaluators/page';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeriesAsync} from './evaluators/series';
import {evaluateStreamAsync} from './evaluators/stream';
import {FunimationContext} from './FunimationContext';
import {FunimationCredential} from './FunimationCredential';
import querystring from 'querystring';
const baseUrl = 'https://www.funimation.com';

export class Funimation {
  private readonly browserService: app.BrowserService;
  private readonly composeService: app.ComposeService;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this.browserService = browserService;
    this.composeService = composeService;
  }

  context() {
    const id = app.api.RemoteProviderId.Funimation;
    const label = 'Funimation';
    const pages = FunimationContext.pages();
    return new app.api.RemoteProvider({id, label, pages});
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async pageAsync(page?: string, options?: Array<string>, pageNumber = 1) {
    const pageSource = FunimationContext.findPage(page);
    const pageUrl = createPageUrl(pageSource, options, pageNumber).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(pageUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluatePage);
      return this.composeService.search(pageUrl, search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    const searchRaw = querystring.stringify({categoryType: 'Series', q: query});
    const searchUrl = new URL(`/search/${pageNumber}/?${searchRaw}`, baseUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(searchUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch);
      return this.composeService.search(searchUrl, search, headers);
    });
  }

  async seriesAsync(seriesUrl: string) {
    const qidSeriesUrl = new URL('?qid=None', seriesUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(qidSeriesUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, qidSeriesUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeriesAsync);
      return this.composeService.series(qidSeriesUrl, series, headers);
    });
  }

  async streamAsync(episodeUrl: string) {
    const qidEpisodeUrl = new URL('?qid=None&lang=japanese', episodeUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(qidEpisodeUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, qidEpisodeUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStreamAsync);
      return await this.composeService.streamAsync(qidEpisodeUrl, stream, headers);
    });
  }
}

function createPageUrl(page?: app.api.RemoteProviderPage, options?: Array<string>, pageNumber = 1) {
  if (page && page.id === 'genres') return options && options.length && page.options.find(x => x.id === options[0])
    ? new URL(`/shows/all-shows/?${querystring.stringify({genre: options[0], audio: 'japanese', sort: 'date', p: pageNumber})}`, baseUrl)
    : new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: 'date', p: pageNumber})}`, baseUrl);
  return page
    ? new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: page.id, p: pageNumber})}`, baseUrl)
    : new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: 'popularity', p: pageNumber})}`, baseUrl);
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
