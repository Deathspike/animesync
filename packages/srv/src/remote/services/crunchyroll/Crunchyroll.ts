import * as app from '../..';
import * as ncm from '@nestjs/common';
import {evaluateSeries} from './evaluators/series';
import {evaluateStream} from './evaluators/stream';
import playwright from 'playwright-core';

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
      await tryLoginAsync(page, seriesUrl);
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
      await tryLoginAsync(page, streamUrl);
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

async function tryLoginAsync(page: playwright.Page, url: string) {
  const isAuthenticated = () => Boolean(document.querySelector('.username'));
  if (!app.settings.credential.crunchyrollUsername || !app.settings.credential.crunchyrollPassword || await page.evaluate(isAuthenticated)) return;
  await page.goto(new URL('/login', url).toString(), {waitUntil: 'domcontentloaded'});
  await page.type('#login_form_name', app.settings.credential.crunchyrollUsername);
  await page.type('#login_form_password', app.settings.credential.crunchyrollPassword);
  await page.evaluate(() => document.querySelector('.opt-in')?.remove());
  await page.click('#login_submit_button', {force: true});
  await page.waitForFunction(isAuthenticated);
  await page.goto(url, {waitUntil: 'domcontentloaded'});
}
