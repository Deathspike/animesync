import * as app from '..';
import crunchyrollAsync from './crunchyroll';
import puppeteer from 'puppeteer-core';

export async function seriesAsync(page: puppeteer.Page, rootPath: string, seriesUrl: string) {
  console.log(`Fetching ${seriesUrl}`);
  const elapsedTime = new app.Timer();
  await page.goto(seriesUrl, {waitUntil: 'domcontentloaded'});
  switch (await page.evaluate(() => window.location.hostname)) {
    case 'www.crunchyroll.com':
      await crunchyrollAsync(page, rootPath);
      console.log(`Finished ${seriesUrl} (${elapsedTime})`);
      break;
    default:
      console.log(`Rejected ${seriesUrl} (${elapsedTime})`);
      break;
  }
}
