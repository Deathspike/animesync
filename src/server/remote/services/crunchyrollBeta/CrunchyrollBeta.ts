import * as api from './typings';
import * as app from '../..';
import * as ncm from '@nestjs/common';
import {CrunchyrollBetaRemap} from './CrunchyrollBetaRemap';
import playwright from 'playwright-core';

@ncm.Injectable()
export class CrunchyrollBeta implements app.IProvider {
  private readonly agentService: app.AgentService;
  private readonly browserService: app.BrowserService;

  constructor(agentService: app.AgentService, browserService: app.BrowserService) {
    this.agentService = agentService;
    this.browserService = browserService;
  }

  isSeriesAsync(seriesUrl: string) {
    const isSeries = /^https:\/\/beta\.crunchyroll\.com\/series\/[^\/]+\/[^\/]+$/.test(seriesUrl);
    return Promise.resolve(isSeries);
  }

  isStreamAsync(streamUrl: string) {
    const isStream = /^https:\/\/beta\.crunchyroll\.com\/watch\/[^\/]+\/[^\/]+$/.test(streamUrl);
    return Promise.resolve(isStream);
  }
  
  async seriesAsync(seriesUrl: string) {
    const baseUrl = new URL(seriesUrl).origin;
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      await tryLoginAsync(page);
      const [episodesPromise, seasonsPromise, seriesPromise] = new app.Observer(page).getAsync(/\/-|crunchyroll\/episodes$/, /\/-|crunchyroll\/seasons$/, /\/-|crunchyroll\/series\/[^\/]+$/);
      await page.evaluate(tryNavigateEvaluator, seriesUrl);
      const seasons = await seasonsPromise.then(x => x.json() as Promise<api.Collection<api.Season>>);
      const series = await seriesPromise.then(x => x.json() as Promise<api.Series>);
      const seasonEpisodes = await this.fetchEpisodesAsync(episodesPromise, seasons);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = CrunchyrollBetaRemap.series(seriesUrl, series, seasons, seasonEpisodes);
      return new app.Composable(seriesUrl, value, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    const baseUrl = new URL(streamUrl).origin;
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      await tryLoginAsync(page);
      const [streamsPromise] = new app.Observer(page).getAsync(/\/-|crunchyroll\/videos\/[^\/]+\/streams$/);
      await page.evaluate(tryNavigateEvaluator, streamUrl);
      const streams = await streamsPromise.then(x => x.json() as Promise<api.Streams>);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = CrunchyrollBetaRemap.stream(streams);
      return new app.Composable(streamUrl, value, headers);
    });
  }

  private async fetchEpisodesAsync(episodesPromise: Promise<playwright.Response>, seasons: api.Collection<api.Season>) {
    const episodesResponse = await episodesPromise;
    const episodesRequest = episodesResponse.request();
    const episodesUrl = episodesRequest.url();
    return await Promise.all(seasons.items.map(async (season) => {
      const seasonUrl = episodesUrl.replace(/((\?|&)season_id=)[^&]+/, (_, x) => x + season.id);
      if (episodesUrl !== seasonUrl) {
        const headers = Object.entries(episodesRequest.headers()).filter(x => !x[0].startsWith(':'));
        const buffer = await this.agentService.fetchAsync(seasonUrl, {headers});
        return JSON.parse(buffer.toString()) as api.Collection<api.Episode>;
      } else {
        const episodes = await episodesResponse.json();
        return episodes as api.Collection<api.Episode>;
      }
    }));   
  }
}

const defaultHeaders = {
  origin: 'https://beta.crunchyroll.com',
  referer: 'https://beta.crunchyroll.com/'
};

async function tryLoginAsync(page: playwright.Page) {
  const isAuthenticated = () => Boolean(JSON.parse(localStorage.getItem('ajs_user_id') ?? 'null'));
  if (!app.settings.credential.crunchyrollUsername || !app.settings.credential.crunchyrollPassword || await page.evaluate(isAuthenticated)) return;
  await page.goto('https://www.crunchyroll.com/login', {waitUntil: 'networkidle'});
  await page.click('#onetrust-accept-btn-handler', {timeout: 1000}).then(() => page.waitForNavigation({waitUntil: 'domcontentloaded'})).catch(() => {});
  await page.evaluate(() => document.querySelector('.opt-in')?.remove());
  await page.type('#login_form_name', app.settings.credential.crunchyrollUsername);
  await page.type('#login_form_password', app.settings.credential.crunchyrollPassword);
  await page.click('#login_submit_button', {force: true});
  await page.waitForFunction(isAuthenticated);
}

async function tryNavigateEvaluator(url: string) {
  history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
