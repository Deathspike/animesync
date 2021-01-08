import * as app from '../..';
import {evaluateQuery} from './evaluators/query';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import querystring from 'querystring';
const baseUrl = 'https://www.crunchyroll.com';

export const crunchyrollProvider = {
  isSupported(url: string) {
    return url.startsWith(baseUrl);
  },

  async popularAsync(context: app.Context, pageNumber = 1) {
    const queryUrl = createQueryUrl('popular', pageNumber);
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const query = await page.evaluate(evaluateQuery);
      query.series.forEach(x => x.imageUrl = context.rewrite.createEmulateUrl(x.imageUrl, headers));
      return query;
    });
  },
  
  async seriesAsync(context: app.Context, seriesUrl: string) {
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeries);
      series.imageUrl = context.rewrite.createEmulateUrl(series.imageUrl, headers);
      series.seasons.forEach(x => x.episodes.forEach(y => y.imageUrl = context.rewrite.createEmulateUrl(y.imageUrl, headers)));
      return series;
    });
  },

  async streamAsync(context: app.Context, episodeUrl: string) {
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStream);
      stream.manifestUrl = context.rewrite.createHlsUrl(stream.manifestUrl, headers);
      stream.subtitles.forEach(x => x.url = context.rewrite.createEmulateUrl(x.url, headers));
      return stream;
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
