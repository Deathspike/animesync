import * as app from '../..';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import querystring from 'querystring';
const baseUrl = 'https://www.crunchyroll.com';

export class CrunchyRollProvider {
  private readonly _browserService: app.BrowserService;
  private readonly _composeService: app.ComposeService;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this._browserService = browserService;
    this._composeService = composeService;
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async popularAsync(pageNumber = 1) {
    const queryUrl = createQueryUrl('popular', pageNumber);
    return await this._browserService.pageAsync(async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch);
      return this._composeService.search(search, headers);
    });
  }
  
  async seriesAsync(seriesUrl: string) {
    return await this._browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeries);
      return this._composeService.series(series, headers);
    });
  }

  async streamAsync(episodeUrl: string) {
    return await this._browserService.pageAsync(async (page, userAgent) => {
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStream);
      return this._composeService.stream(stream, headers);
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
