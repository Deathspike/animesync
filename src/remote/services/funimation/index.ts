import * as app from '../..';
import {evaluatePage} from './evaluators/page';
import {evaluateSearch} from './evaluators/search';
import {evaluateSeriesAsync} from './evaluators/series';
import querystring from 'querystring';
const baseUrl = 'https://www.funimation.com';

export class FunimationProvider {
  private readonly browserService: app.BrowserService;
  private readonly composeService: app.ComposeService;

  constructor(browserService: app.BrowserService, composeService: app.ComposeService) {
    this.browserService = browserService;
    this.composeService = composeService;
  }

  context() {
    const id = app.api.RemoteProviderId.Funimation;
    const label = 'Funimation';
    const pages: Array<app.api.RemoteProviderPage> = [{type: 'oneOf', id: 'popularity', label: 'Popularity', options: []}];
    return new app.api.RemoteProvider({id, label, pages});
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async popularAsync(pageNumber = 1) {
    const queryUrl = createQueryUrl('popularity', pageNumber);
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluatePage);
      return this.composeService.search(search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    const queryRaw = querystring.stringify({categoryType: 'Series', q: query});
    const queryUrl = new URL(`/search/${pageNumber}/?${queryRaw}`, baseUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(queryUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluateSearch);
      return this.composeService.search(search, headers);
    });
  }

  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeriesAsync);
      return this.composeService.series(series, headers);
    });
  }

  async streamAsync(episodeUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      const [manifestPromise, vttSubtitlePromise] = new app.Observer(page).getAsync(/\.m3u8$/i, /\.vtt$/i);
      await page.goto(episodeUrl, {waitUntil: 'domcontentloaded'});
      const manifestSrc = await manifestPromise.then(x => x.url());
      const vttSubtitleSrc = await vttSubtitlePromise.then(x => x.url());
      await page.close();
      if (manifestSrc && vttSubtitleSrc) {
        const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
        const subtitle = new app.api.RemoteStreamSubtitle({language: 'eng', type: 'vtt', url: vttSubtitleSrc});
        const stream = new app.api.RemoteStream({subtitles: [subtitle], type: 'hls', url: manifestSrc});
        return this.composeService.stream(stream, headers);
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
