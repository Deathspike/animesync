import * as app from '../..';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export default async function crunchyrollAsync(page: puppeteer.Page, rootPath: string) {
  for (const season of await page.evaluate(scraper.seasons)) {
    if (/\(.+\)/.test(season.title)) continue;
    const seriesPath = path.join(rootPath, sanitizeFilename(season.title));
    const seriesReport = await app.Series.loadAsync(seriesPath);
    for (const episode of season.episodes) {
      const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
      const number = numberMatch ? parseInt(numberMatch[1], 10) : -1;
      if (number >= 0) {
        const elapsedTime = new app.Timer();
        const episodeName = `${sanitizeFilename(season.title)} ${String(number).padStart(2, '0')} [CrunchyRoll].mkv`;
        const episodePath = path.join(seriesPath, episodeName);
        if (seriesReport.includes(episode.url)) {
          console.log(`Skipping ${episodeName}`);
        } else if (await fs.pathExists(episodePath)) {
          console.log(`Skipping ${episodeName}`);
          await seriesReport.trackAsync(episodeName, episode.url);
        } else try {
          console.log(`Fetching ${episodeName}`);
          await app.episodeAsync(page, episodePath, episode.url);
          await seriesReport.trackAsync(episodeName, episode.url);
          console.log(`Finished ${episodeName} (${elapsedTime})`);
        } catch (err) {
          console.log(`Rejected ${episodeName} (${elapsedTime})`);
          console.log(err);
        }
      }
    }
  }
}
