import * as app from '../..';
import {evaluateQuery} from './evaluators/query';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import querystring from 'querystring';

export const crunchyrollProvider = {
  async popularAsync(context: app.Context, pageNumber = 1): Promise<app.IApiQuery> {
    const queryUrl = createQueryUrl(pageNumber, 'popularity');
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const query = await page.evaluate(evaluateQuery);
      query.series.forEach(x => x.imageUrl = context.rewrite.createEmulateUrl(x.imageUrl, headers));
      return query;
    });
  },
  
  async seriesAsync(context: app.Context, seriesUrl: string): Promise<app.IApiSeries> {
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeries);
      series.imageUrl = context.rewrite.createEmulateUrl(series.imageUrl, headers);
      series.seasons.forEach(x => x.episodes.forEach(y => y.imageUrl = context.rewrite.createEmulateUrl(y.imageUrl, headers)));
      return series;
    });
  },

  async streamAsync(context: app.Context, episodeUrl: string): Promise<app.IApiStream> {
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

function createQueryUrl(pageNumber: number, sort: string) {
  const page = pageNumber > 1 ? {pg: pageNumber} : undefined;
  const query = querystring.stringify(page);
  return new URL(`https://crunchyroll.com/videos/anime/${encodeURIComponent(sort)}/ajax_page?${query}`).toString();
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/'
};
