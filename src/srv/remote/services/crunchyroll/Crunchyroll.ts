import * as app from '../..';
import * as ncm from '@nestjs/common';
import {CrunchyrollCredential} from './CrunchyrollCredential';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
const baseUrl = 'https://www.crunchyroll.com';

@ncm.Injectable()
export class Crunchyroll implements app.IProvider {
  private readonly browserService: app.BrowserService;

  constructor(browserService: app.BrowserService) {
    this.browserService = browserService;
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/www\.crunchyroll\.com\/[^\/]+$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/www\.crunchyroll\.com\/[^\/]+\/[^\/]+$/.test(streamUrl);
    return Promise.resolve(isStream);
  }
  
  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollCredential.tryAsync(baseUrl, page, seriesUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      if (/\/maturity_wall\?/.test(page.url())) {
        await page.goto(`${seriesUrl}?skip_wall=1`, {waitUntil: 'domcontentloaded'});
        const value = await page.evaluate(evaluateSeries);
        return new app.Composable(seriesUrl, value, headers);
      } else {
        const value = await page.evaluate(evaluateSeries);
        return new app.Composable(seriesUrl, value, headers);
      }
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollCredential.tryAsync(baseUrl, page, streamUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = await page.evaluate(evaluateStream);
      return new app.Composable(streamUrl, value, headers);
    });
  }
}

const defaultHeaders = {
  origin: 'https://static.crunchyroll.com',
  referer: 'https://static.crunchyroll.com/'
};
