import * as app from '../..';
import * as ncm from '@nestjs/common';
import * as vrv from './typings';
import {VrvRemap} from './VrvRemap';
import playwright from 'playwright-core';

@ncm.Injectable()
export class Vrv implements app.IProvider {
  private readonly agentService: app.AgentService;
  private readonly browserService: app.BrowserService;

  constructor(agentService: app.AgentService, browserService: app.BrowserService) {
    this.agentService = agentService;
    this.browserService = browserService;
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/vrv\.co\/series\/[^\/]+\/[^\/]+$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/vrv\.co\/watch\/[^\/]+\/[^\/]+\:[^\/]+$/.test(streamUrl);
    return Promise.resolve(isStream);
  }
  
  async seriesAsync(seriesUrl: string) {
    const baseUrl = new URL(seriesUrl).origin;
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'networkidle'});
      await tryLoginAsync(page);
      await page.waitForLoadState('networkidle');
      const [episodesPromise, seasonsPromise, seriesPromise] = new app.Observer(page).getAsync(/\/-\/episodes$/, /\/-\/seasons$/, /\/-\/series\/[^\/]+$/);
      await page.evaluate(tryNavigateEvaluator, seriesUrl);
      const seasons = await seasonsPromise.then(x => x.json() as Promise<vrv.Collection<vrv.Season>>);
      const series = await seriesPromise.then(x => x.json() as Promise<vrv.Series>);
      const seasonEpisodes = await this.fetchEpisodesAsync(episodesPromise, seasons);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.series(seriesUrl, series, seasons, seasonEpisodes);
      return new app.Composable(seriesUrl, value, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    const baseUrl = new URL(streamUrl).origin;
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'networkidle'});
      await tryLoginAsync(page);
      const [streamsPromise] = new app.Observer(page).getAsync(/\/-\/videos\/[^\/]+\/streams$/);
      await page.evaluate(tryNavigateEvaluator, streamUrl);
      const streams = await streamsPromise.then(x => x.json() as Promise<vrv.Streams>);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.stream(streams);
      return new app.Composable(streamUrl, value, headers);
    });
  }

  private async fetchEpisodesAsync(episodesPromise: Promise<playwright.Response>, seasons: vrv.Collection<vrv.Season>) {
    const episodesResponse = await episodesPromise;
    const episodesRequest = episodesResponse.request();
    const episodesUrl = episodesRequest.url();
    return await Promise.all(seasons.items.map(async (season) => {
      const seasonUrl = episodesUrl.replace(/((\?|&)season_id=)[^&]+/, (_, x) => x + season.id);
      if (episodesUrl !== seasonUrl) {
        const headers = Object.entries(episodesRequest.headers()).filter(x => !x[0].startsWith(':'));
        const buffer = await this.agentService.fetchAsync(seasonUrl, {headers});
        return JSON.parse(buffer.toString()) as vrv.Collection<vrv.Episode>;
      } else {
        const episodes = await episodesResponse.json();
        return episodes as vrv.Collection<vrv.Episode>;
      }
    }));
  }
}

const defaultHeaders = {
  origin: 'https://vrv.co',
  referer: 'https://vrv.co/'
};

async function tryLoginAsync(page: playwright.Page) {
  const isAuthenticated = () => Boolean(JSON.parse(localStorage.getItem('ajs_user_id') ?? 'null'));
  if (!app.settings.credential.vrvUsername || !app.settings.credential.vrvPassword || await page.evaluate(isAuthenticated)) return;
  await page.click('.erc-anonymous-user-nav');
  await page.click('.erc-user-dropdown a.erc-user-dropdown-item:last-child');
  await page.type('.erc-signin .email-input', app.settings.credential.vrvUsername);
  await page.type('.erc-signin .password-input', app.settings.credential.vrvPassword);
  await page.click('.erc-signin .signin-submit');
  await page.waitForFunction(isAuthenticated);
}

async function tryNavigateEvaluator(url: string) {
  history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
