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
    const seriesTrace = await app.Trace.loadAsync(seriesPath);
    for (const episode of season.episodes) {
      const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
      const number = numberMatch ? parseInt(numberMatch[1], 10) : -1;
      if (number >= 0) {
        const elapsedTime = new app.Timer();
        const fileName = `${sanitizeFilename(season.title)} ${String(number).padStart(2, '0')} [CrunchyRoll].mkv`;
        const filePath = path.join(seriesPath, fileName);
        if (seriesTrace.includes(episode.url)) {
          console.log(`Skipping ${fileName}`);
        } else if (await fs.pathExists(filePath)) {
          console.log(`Skipping ${fileName}`);
          await seriesTrace.traceAsync(episode.url, fileName);
        } else try {
          console.log(`Fetching ${fileName}`);
          await app.episodeAsync(episode.url, filePath);
          await seriesTrace.traceAsync(episode.url, filePath);
          console.log(`Finished ${fileName} (${elapsedTime})`);
        } catch (err) {
          console.log(`Rejected ${fileName} (${elapsedTime})`);
          console.log(err);
        }
      }
    }
  }
}
