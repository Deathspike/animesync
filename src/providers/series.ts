import * as app from '..';
import crunchyrollAsync from './crunchyroll';

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
