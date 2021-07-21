import * as app from '../..';
import * as ncm from '@nestjs/common';
import {evaluateSeriesAsync} from './evaluators/series';
import {evaluateStreamAsync} from './evaluators/stream';
import {FunimationCredential} from './FunimationCredential';
const baseUrl = 'https://www.funimation.com';

@ncm.Injectable()
export class Funimation implements app.IProvider {
  private readonly browserService: app.BrowserService;

  constructor(browserService: app.BrowserService) {
    this.browserService = browserService;
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/[^\/]+\/$/.test(streamUrl);
    return Promise.resolve(isStream);
  }

  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, seriesUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const series = await page.evaluate(evaluateSeriesAsync);
      return new app.Composable(seriesUrl, series, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await FunimationCredential.tryAsync(baseUrl, page, streamUrl);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const stream = await page.evaluate(evaluateStreamAsync);
      return new app.Composable(streamUrl, stream, headers);
    });
  }
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};
