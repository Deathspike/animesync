import * as app from '../..';
import {evaluateRegion} from './evaluators/region';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import querystring from 'querystring';
const baseUrl = 'https://www.crunchyroll.com';

export class CrunchyRollProvider {
  private readonly browserService: app.BrowserService;
  private readonly composeService: app.ComposeService;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this.browserService = browserService;
    this.composeService = composeService;
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async popularAsync(pageNumber = 1) {
    const queryUrl = createQueryUrl('popular', pageNumber);
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateRegion);
      return this.composeService.search(search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch, {query, pageNumber});
      return this.composeService.search(search, headers);
    });
  }
  
  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeries);
      return this.composeService.series(series, headers);
    });
  }

  async streamAsync(episodeUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStream);
      return this.composeService.stream(stream, headers);
    });
  }
}

function createQueryUrl(sort: string, pageNumber = 1) {
  const page = pageNumber > 1 ? {pg: pageNumber} : undefined;
  const query = querystring.stringify(page);
  return new URL(`/videos/anime/${encodeURIComponent(sort)}/ajax_page?${query}`, baseUrl).toString();
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/'
};
