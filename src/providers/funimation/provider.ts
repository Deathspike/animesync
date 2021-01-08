import * as app from '../..';
import {evaluateQuery} from './evaluators/query';
import {evaluateSeriesAsync} from './evaluators/series';
import querystring from 'querystring';

export const funimationProvider = {
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
      const series = await page.evaluate(evaluateSeriesAsync);
      series.imageUrl = context.rewrite.createEmulateUrl(series.imageUrl, headers);
      series.seasons.forEach(x => x.episodes.forEach(y => y.imageUrl = context.rewrite.createEmulateUrl(y.imageUrl, headers)));
      return series;
    });
  },

  async streamAsync(context: app.Context, episodeUrl: string): Promise<app.IApiStream> {
    return await app.browserAsync(context, async (page, userAgent) => {
      const [manifestPromise, vttSubtitlePromise] = new app.Observer(page).getAsync(/\.m3u8$/i, /\.vtt$/i);
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const manifestSrc = await manifestPromise.then(x => x.url());
      const vttSubtitleSrc = await vttSubtitlePromise.then(x => x.url());
      await page.close();
      if (manifestSrc && vttSubtitleSrc) {
        const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
        const manifestType = 'hls';
        const manifestUrl = context.rewrite.createHlsUrl(manifestSrc, headers);
        const subtitleUrl = context.rewrite.createEmulateUrl(vttSubtitleSrc, headers);
        const subtitles = [{language: 'eng', type: 'vtt', url: subtitleUrl}];
        return {manifestType, manifestUrl, subtitles};
      } else {
        throw new Error();
      }
    });
  }
};

function createQueryUrl(pageNumber: number, sort: string) {
  const page = pageNumber > 1 ? {p: pageNumber} : undefined;
  const query = querystring.stringify(Object.assign({audio: 'japanese', sort}, page));
  return new URL(`https://www.funimation.com/shows/all-shows/?${query}`).toString();
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
