import * as app from '..';
import {crunchyroll} from './evaluators/crunchyroll';
import fs from 'fs-extra';
import path from 'path';
import puppeteer from 'puppeteer-core';
import sanitizeFilename from 'sanitize-filename';

export async function seriesAsync(seriesUrl: string, libraryPath: string) {
  await app.browserAsync(async (page) => {
    await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
    switch (await page.evaluate(() => window.location.hostname)) {
      case 'www.crunchyroll.com':
        await crunchyrollAsync(page, libraryPath);
        break;
      default:
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
        const fullNumber = number >= 10 ? number : `0${number}`;
        const fileName = `${sanitizeFilename(season.title)} 01x${fullNumber} [Kaizoku].mkv`; // TODO: Name shouldn't come from this.
        const filePath = path.join(libraryPath, sanitizeFilename(season.title), fileName);
        if (!await fs.pathExists(filePath)) await app.episodeAsync(episode.url, filePath);
      }
    }
  }
}
