import * as app from '..';
import crunchyrollAsync from './crunchyroll';

export async function seriesAsync(seriesUrl: string, rootPath: string) {
  console.log(`Fetching ${seriesUrl}`);
  await app.browserAsync(async (page) => {
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
  });
}
