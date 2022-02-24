import * as app from '../..';
import * as fun from './typings';
import * as ncm from '@nestjs/common';
import {FunimationRemap} from './FunimationRemap';
import playwright from 'playwright-core';

@ncm.Injectable()
export class Funimation implements app.IProvider {
  private readonly agentService: app.AgentService;
  private readonly browserService: app.BrowserService;

  constructor(agentService: app.AgentService, browserService: app.BrowserService) {
    this.agentService = agentService;
    this.browserService = browserService;
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/www\.funimation\.com\/shows\/[^\/]+\/$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/www\.funimation\.com\/[^\/]{2}\/shows\/[^\/]+\/[^\/]+\/$/.test(streamUrl);
    return Promise.resolve(isStream);
  }

  async seriesAsync(seriesUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      const observer = new app.Observer(page);     
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await tryLoginAsync(page, seriesUrl);
      const [seriesPromise, episodesPromise] = observer.getAsync(/\/shows\/[^\/]+$/, /\/seasons\/[^\/]+$/);
      const series = await seriesPromise.then(x => x.json() as Promise<fun.Series>);
      const seasonEpisodes = await this.fetchEpisodesAsync(episodesPromise, series);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const locale = await page.evaluate(() => (window as any).locale);
      const value = FunimationRemap.series(seriesUrl, series, seasonEpisodes, locale ?? undefined);
      return new app.Composable(seriesUrl, value, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      const observer = new app.Observer(page);
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await tryLoginAsync(page, streamUrl);
      const [streamPromise] = observer.getAsync(/\/v1\/play(\/[^\/]+)?\/[^\/]+$/);
      const stream = await streamPromise.then(x => x.json() as Promise<fun.Stream>);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = FunimationRemap.stream(stream);
      return new app.Composable(streamUrl, value, headers);
    });
  }

  private async fetchEpisodesAsync(episodesPromise: Promise<playwright.Response>, series: fun.Series) {
    const episodesResponse = await episodesPromise;
    const episodesRequest = episodesResponse.request();
    const episodesUrl = episodesRequest.url();
    return await Promise.all(series.seasons.map(async (season) => {
      const seasonUrl = episodesUrl.replace(/(\/seasons\/).+(\.json)/, (_, x, y) => x + season.id + y);
      if (episodesUrl !== seasonUrl) {
        const headers = Object.entries(episodesRequest.headers()).filter(([k]) => !k.startsWith(':'));
        const buffer = await this.agentService.fetchAsync(seasonUrl, {headers});
        return JSON.parse(buffer.toString()) as fun.Season;
      } else {
        const episodes = await episodesResponse.json();
        return episodes as fun.Season;
      }
    }));
  }
}

const defaultHeaders = {
  origin: 'https://www.funimation.com',
  referer: 'https://www.funimation.com/'
};

async function tryLoginAsync(page: playwright.Page, url: string) {
  const isAuthenticated = () => Boolean(localStorage.getItem('userId'));
  if (!app.settings.credential.funimationUsername || !app.settings.credential.funimationPassword || await page.evaluate(isAuthenticated)) return;
  await page.goto(new URL('/log-in/', url).toString(), {waitUntil: 'domcontentloaded'});
  await page.type('.loginBox #email2', app.settings.credential.funimationUsername);
  await page.type('.loginBox #password2', app.settings.credential.funimationPassword);
  const navigationPromise = page.waitForNavigation({waitUntil: 'domcontentloaded'});
  await page.click('.loginBox button[type=submit]');
  await page.waitForFunction(isAuthenticated);
  await navigationPromise;
  await page.goto(url, {waitUntil: 'domcontentloaded'});
}
