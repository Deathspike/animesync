import * as app from '../..';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeriesAsync} from './evaluators/series';
import {rewrite} from '../rewrite';
import querystring from 'querystring';
const baseUrl = 'https://www.funimation.com';

export const funimationProvider = {
  isSupported(url: string) {
    return url.startsWith(baseUrl);
  },

  async popularAsync(context: app.Context, pageNumber = 1) {
    const queryUrl = createQueryUrl('popularity', pageNumber);
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch);
      return rewrite.search(context, search, headers);
    });
  },

  async seriesAsync(context: app.Context, seriesUrl: string) {
    return await app.browserAsync(context, async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeriesAsync);
      return rewrite.series(context, series, headers);
    });
  },

  async streamAsync(context: app.Context, episodeUrl: string) {
    return await app.browserAsync(context, async (page, userAgent) => {
      const [manifestPromise, vttSubtitlePromise] = new app.Observer(page).getAsync(/\.m3u8$/i, /\.vtt$/i);
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const manifestSrc = await manifestPromise.then(x => x.url());
      const vttSubtitleSrc = await vttSubtitlePromise.then(x => x.url());
      await page.close();
      if (manifestSrc && vttSubtitleSrc) {
        const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
        const subtitle = new app.models.RemoteStreamSubtitle({language: 'eng', type: 'vtt', url: vttSubtitleSrc});
        const stream = new app.models.RemoteStream({subtitles: [subtitle], type: 'hls', url: manifestSrc});
        return rewrite.stream(context, stream, headers);
      } else {
        throw new Error();
      }
    });
  }
};

function createQueryUrl(sort: string, pageNumber = 1) {
  const page = pageNumber > 1 ? {p: pageNumber} : undefined;
  const query = querystring.stringify(Object.assign({audio: 'japanese', sort}, page));
  return new URL(`/shows/all-shows/?${query}`, baseUrl).toString();
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
