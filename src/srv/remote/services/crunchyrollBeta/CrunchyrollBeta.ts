import * as app from '../..';
import * as ncm from '@nestjs/common';
import * as vrv from '../vrv/typings';
import {CrunchyrollBetaCredential} from './CrunchyrollBetaCredential';
import {VrvRemap} from '../vrv/VrvRemap';
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
    return await this.browserService.pageAsync(async (page, userAgent) => {
      const observer = new app.Observer(page);
      await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollBetaCredential.tryAsync(page, seriesUrl);
      const [episodesPromise, seasonsPromise, seriesPromise] = observer.getAsync(/\/-\/episodes$/, /\/-\/seasons$/, /\/-\/series\/[^\/]+$/);
      const seasons = await seasonsPromise.then(x => x.json() as Promise<vrv.Collection<vrv.Season>>);
      const series = await seriesPromise.then(x => x.json() as Promise<vrv.Series>);
      const seasonEpisodes: Array<vrv.Collection<vrv.Episode>> = [];
      await this.fetchEpisodesAsync(episodesPromise, seasons, seasonEpisodes);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.series(seriesUrl, series, seasons, seasonEpisodes);
      return new app.Composable(seriesUrl, value, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      const observer = new app.Observer(page);
      await page.goto(streamUrl, {waitUntil: 'domcontentloaded'});
      await CrunchyrollBetaCredential.tryAsync(page, streamUrl);
      const [streamsPromise] = observer.getAsync(/\/-\/videos\/[^\/]+\/streams$/);
      const streams = await streamsPromise.then(x => x.json() as Promise<vrv.Streams>);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.stream(streams);
      return new app.Composable(streamUrl, value, headers);
    });
  }

  private async fetchEpisodesAsync(episodesPromise: Promise<playwright.Response>, seasons: vrv.Collection<vrv.Season>, seasonEpisodes: Array<vrv.Collection<vrv.Episode>>) {
    const episodesResponse = await episodesPromise;
    const episodesRequest = episodesResponse.request();
    const episodesUrl = episodesRequest.url();
    for (const season of seasons.items) {
      const seasonUrl = episodesUrl.replace(/((\?|&)season_id=)[^&]+/, (_, x) => x + season.id);
      if (episodesUrl !== seasonUrl) {
        const headers = Object.entries(episodesRequest.headers()).filter(x => !x[0].startsWith(':'));
        const buffer = await this.agentService.fetchAsync(seasonUrl, {headers});
        seasonEpisodes.push(JSON.parse(buffer.toString('utf8')));
      } else {
        const episodes = await episodesResponse.json();
        seasonEpisodes.push(episodes as vrv.Collection<vrv.Episode>);
      }
    }
  }
}

const defaultHeaders = {
  origin: 'https://beta.crunchyroll.com',
  referer: 'https://beta.crunchyroll.com/'
};
