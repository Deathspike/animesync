import * as app from '../..';
import * as ncm from '@nestjs/common';
import {CrunchyrollContext} from './CrunchyrollContext';
import {CrunchyrollCredential} from './CrunchyrollCredential';
import {evaluatePage} from './evaluators/page';
import {evaluateSearchAsync} from './evaluators/search';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import querystring from 'querystring';
const baseUrl = 'https://www.crunchyroll.com';

@ncm.Injectable()
export class Crunchyroll implements app.IProvider {
  private readonly browserService: app.BrowserService;
  private readonly composeService: app.ComposeService;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this.browserService = browserService;
    this.composeService = composeService;
  }

  contextAsync() {
    const id = 'crunchyroll';
    const label = 'Crunchyroll';
    const pages = CrunchyrollContext.pages();
    return Promise.resolve(new app.api.RemoteProvider({id, label, pages}));
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/www\.crunchyroll\.com\/[^\/]+$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/www\.crunchyroll\.com\/[^\/]+\/[^\/]+$/.test(streamUrl);
    return Promise.resolve(isStream);
  }
  
  async pageAsync(page?: string, options?: Array<string>, pageNumber = 1) {
    const pageSource = CrunchyrollContext.findPage(page);
    const pageUrl = createPageUrl(pageSource, options, pageNumber).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(pageUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluatePage);
      return this.composeService.search(pageUrl, search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearchAsync, {query, pageNumber});
      return this.composeService.search(baseUrl, search, headers);
    });
  }
  
  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollCredential.tryAsync(baseUrl, page, seriesUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      if (/\/maturity_wall\?/.test(page.url())) {
        await page.goto(`${seriesUrl}?skip_wall=1`, {waitUntil: 'domcontentloaded'});
        const series = await page.evaluate(evaluateSeries);
        return this.composeService.series(seriesUrl, series, headers);
      } else {
        const series = await page.evaluate(evaluateSeries);
        return this.composeService.series(seriesUrl, series, headers);
      }
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollCredential.tryAsync(baseUrl, page, streamUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStream);
      return await this.composeService.streamAsync(streamUrl, stream, headers);
    });
  }
}

function createPageUrl(page?: app.api.RemoteProviderPage, options?: Array<string>, pageNumber = 1) {
  if (page && page.id === 'genres') return options && options.length && options.every(x => page.options.find(y => x === y.id))
    ? new URL(`/videos/anime/${page.id}/ajax_page?${querystring.stringify({pg: pageNumber - 1, tagged: options.join(',')})}`, baseUrl)
    : new URL(`/videos/anime/${page.id}/ajax_page?${querystring.stringify({pg: pageNumber - 1})}`, baseUrl);
  if (page && page.id === 'seasons') return options && options.length && page.options.find(x => x.id === options[0])
    ? new URL(`/videos/anime/${page.id}/ajax_page?${querystring.stringify({pg: pageNumber - 1, 'tagged[]': `season:${options[0]}`})}`, baseUrl)
    : new URL(`/videos/anime/${page.id}/ajax_page?${querystring.stringify({pg: pageNumber - 1, 'tagged[]': `season:${page.options[0].id}`})}`, baseUrl);
  return page
    ? new URL(`/videos/anime/${page.id}/ajax_page?${querystring.stringify({pg: pageNumber - 1})}`, baseUrl)
    : new URL(`/videos/anime/popular/ajax_page?${querystring.stringify({pg: pageNumber - 1})}`, baseUrl);
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/'
};
