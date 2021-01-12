import * as app from '../..';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import {rewrite} from '../rewrite';
import querystring from 'querystring';
const baseUrl = 'https://www.crunchyroll.com';

export const crunchyrollProvider = {
  isSupported(url: string) {
    return url.startsWith(baseUrl);
  },

  async popularAsync(context: app.Context, pageNumber = 1) {
    const queryUrl = createQueryUrl('popular', pageNumber);
    return await app.browserAsync(async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch);
      return rewrite.search(context, search, headers);
    });
  },
  
  async seriesAsync(context: app.Context, seriesUrl: string) {
    return await app.browserAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeries);
      return rewrite.series(context, series, headers);
    });
  },

  async streamAsync(context: app.Context, episodeUrl: string) {
    return await app.browserAsync(async (page, userAgent) => {
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStream);
      return rewrite.stream(context, stream, headers);
    });
  }
};

function createQueryUrl(sort: string, pageNumber = 1) {
  const page = pageNumber > 1 ? {pg: pageNumber} : undefined;
  const query = querystring.stringify(page);
  return new URL(`/videos/anime/${encodeURIComponent(sort)}/ajax_page?${query}`, baseUrl).toString();
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/'
};
