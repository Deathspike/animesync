import * as app from '..';
import fs from 'fs-extra';

export async function downloadAsync() {
  await fs.remove(app.settings.episodeSync);
  console.log(`Fetching ${app.settings.library}`);
  await app.browserAsync(async (page) => {
    const elapsedTime = new app.Timer();
    const seriesList = await app.Library.listAsync(app.settings.library);
    for (const series of seriesList) await app.seriesAsync(page, series.seriesPath, series.seriesUrl);
    console.log(`Finished ${app.settings.library} (${elapsedTime})`);
  });
}
