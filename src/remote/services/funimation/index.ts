import * as ace from '../../..';
import * as acm from '../..';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeriesAsync} from './evaluators/series';
import querystring from 'querystring';
const baseUrl = 'https://www.funimation.com';

export class FunimationProvider {
  private readonly _browserService: ace.shr.BrowserService;
  private readonly _composeService: acm.ComposeService;

  constructor(browserService: ace.shr.BrowserService, composeService: acm.ComposeService) {
    this._browserService = browserService;
    this._composeService = composeService;
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async popularAsync(pageNumber = 1) {
    const queryUrl = createQueryUrl('popularity', pageNumber);
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
      const series = await page.evaluate(evaluateSeriesAsync);
      return this._composeService.series(series, headers);
    });
  }

  async streamAsync(episodeUrl: string) {
    return await this._browserService.pageAsync(async (page, userAgent) => {
      const [manifestPromise, vttSubtitlePromise] = new acm.Observer(page).getAsync(/\.m3u8$/i, /\.vtt$/i);
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const manifestSrc = await manifestPromise.then(x => x.url());
      const vttSubtitleSrc = await vttSubtitlePromise.then(x => x.url());
      await page.close();
      if (manifestSrc && vttSubtitleSrc) {
        const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
        const subtitle = new ace.api.RemoteStreamSubtitle({language: 'eng', type: 'vtt', url: vttSubtitleSrc});
        const stream = new ace.api.RemoteStream({subtitles: [subtitle], type: 'hls', url: manifestSrc});
        return this._composeService.stream(stream, headers);
      } else {
        throw new Error();
      }
    });
  }
}

function createQueryUrl(sort: string, pageNumber = 1) {
  const page = pageNumber > 1 ? {p: pageNumber} : undefined;
  const query = querystring.stringify(Object.assign({audio: 'japanese', sort}, page));
  return new URL(`/shows/all-shows/?${query}`, baseUrl).toString();
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
