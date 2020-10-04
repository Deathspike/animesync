import * as app from '../..';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sanitizeFilename from 'sanitize-filename';
import scraper from './scraper';

export default async function crunchyrollAsync(page: puppeteer.Page, libraryPath: string) {
  for (const season of await page.evaluate(scraper.seasons)) {
    if (/\(.+\)/.test(season.title)) continue;
    for (const episode of season.episodes) {
      const numberMatch = episode.title.match(/([0-9]+(?:\.[0-9])?)/);
      const number = numberMatch ? parseInt(numberMatch[1], 10) : -1;
      if (number >= 0) {
        const elapsedTime = new app.Timer();
        const fileName = `${sanitizeFilename(season.title)} ${String(number).padStart(2, '0')} [CrunchyRoll].mkv`;
        const filePath = path.join(libraryPath, sanitizeFilename(season.title), fileName);
        if (!await fs.pathExists(filePath)) try {
          console.log(`Fetching ${fileName}`);
          await app.episodeAsync(episode.url, filePath);
          console.log(`Finished ${fileName} (${elapsedTime})`);
        } catch (err) {
          console.log(`Rejected ${fileName} (${elapsedTime})`);
        }
      }
    }
  }
}
