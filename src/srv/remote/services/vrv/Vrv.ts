import * as app from '../..';
import * as ncm from '@nestjs/common';
import * as scp from './typings';
import {evaluateNavigate} from './evaluators/navigate';
import {evaluateNextSeason} from './evaluators/nextSeason';
import {VrvCredential} from './VrvCredential';
import {VrvRemap} from './VrvRemap';
import playwright from 'playwright-core';
const baseUrl = 'https://vrv.co';

@ncm.Injectable()
export class Vrv implements app.IProvider {
  private readonly browserService: app.BrowserService;

  constructor(browserService: app.BrowserService) {
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
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      await VrvCredential.tryAsync(baseUrl, page);
      const [episodesPromise, seasonsPromise, seriesPromise] = new app.Observer(page).getAsync(/\/-\/episodes$/, /\/-\/seasons$/, /\/-\/series\/[^\/]+$/);
      await page.evaluate(evaluateNavigate, seriesUrl);
      const episodes = await episodesPromise.then(x => x.json() as Promise<scp.Collection<scp.Episode>>);
      const seasons = await seasonsPromise.then(x => x.json() as Promise<scp.Collection<scp.Season>>);
      const series = await seriesPromise.then(x => x.json() as Promise<scp.Series>);
      const seasonEpisodes = await fetchEpisodesAsync([episodes], page);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.series(seriesUrl, series, seasons, seasonEpisodes);
      return new app.Composable(seriesUrl, value, headers);
    });
  }

  async streamAsync(streamUrl: string) {
    return await this.browserService.pageAsync(async (page, userAgent) => {
      await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
      await VrvCredential.tryAsync(baseUrl, page);
      const [streamsPromise] = new app.Observer(page).getAsync(/\/-\/videos\/[^\/]+\/streams$/);
      await page.evaluate(evaluateNavigate, streamUrl);
      const streams = await streamsPromise.then(x => x.json() as Promise<scp.Streams>);
      const headers = Object.assign({'user-agent': userAgent}, defaultHeaders);
      const value = VrvRemap.stream(streams);
      return new app.Composable(streamUrl, value, headers);
    });
  }
}

async function fetchEpisodesAsync(episodes: Array<scp.Collection<scp.Episode>>, page: playwright.Page) {
  while (true) {
    const [episodesPromise] = new app.Observer(page).getAsync(/\/-\/episodes$/);
    if (await page.evaluate(evaluateNextSeason)) {
      episodes.push(await episodesPromise.then(x => x.json() as Promise<scp.Collection<scp.Episode>>));
      continue;
    } else {
      episodesPromise.catch(() => {});
      return episodes;
    }
  }
}

const defaultHeaders = {
  origin: 'https://vrv.co',
  referer: 'https://vrv.co/'
};
