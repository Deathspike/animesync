import * as app from '..';
import {crunchyroll} from './evaluators/crunchyroll';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sanitizeFilename from 'sanitize-filename';

export async function seriesAsync(seriesUrl: string, libraryPath: string) {
  console.log(`Awaiting ${seriesUrl}`);
  await app.browserAsync(async (page) => {
    const elapsedTime = new app.Timer();
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    switch (await page.evaluate(() => window.location.hostname)) {
      case 'www.crunchyroll.com':
        console.log(`Fetching ${seriesUrl}`);
        await crunchyrollAsync(page, libraryPath);
        console.log(`Finished ${seriesUrl} (${elapsedTime})`);
        break;
      default:
        console.log(`Rejected ${seriesUrl}`);
        break;
    }
  });
}

async function crunchyrollAsync(page: puppeteer.Page, libraryPath: string) {
  for (const season of await page.evaluate(crunchyroll)) {
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
