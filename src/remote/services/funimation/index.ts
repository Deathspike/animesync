import * as app from '../..';
import {createPages} from './pages';
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
    const pages = createPages();
    return new app.api.RemoteProvider({id, label, pages});
  }

  isSupported(url: string) {
    return url.startsWith(baseUrl);
  }

  async pageAsync(page?: string, options?: Array<string>, pageNumber = 1) {
    const pageSource = createPages().find(x => x.id === page);
    const pageUrl = createPageUrl(pageSource, options, pageNumber);
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(pageUrl.toString(), {waitUntil: 'domcontentloaded'});
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const search = await page.evaluate(evaluatePage);
      return this.composeService.search(search, headers);
    });
  }

  async searchAsync(query: string, pageNumber = 1) {
    const queryRaw = querystring.stringify({categoryType: 'Series', q: query});
    const queryUrl = new URL(`/search/${pageNumber}/?${queryRaw}`, baseUrl).toString();
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(queryUrl.toString(), {waitUntil: 'domcontentloaded'});
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

function createPageUrl(page?: app.api.RemoteProviderPage, options?: Array<string>, pageNumber = 1) {
  if (page && page.id === 'genres') return options && options.length && page.options.find(x => x.id === options[0])
    ? new URL(`/shows/all-shows/?${querystring.stringify({genre: options[0], audio: 'japanese', sort: 'date', p: pageNumber})}`, baseUrl)
    : new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: 'date', p: pageNumber})}`, baseUrl);
  return page
    ? new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: page.id, p: pageNumber})}`, baseUrl)
    : new URL(`/shows/all-shows/?${querystring.stringify({audio: 'japanese', sort: 'popularity', p: pageNumber})}`, baseUrl);
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
