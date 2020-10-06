import * as app from '..';
import fs from 'fs-extra';

export async function downloadAsync() {
  await fs.remove(app.settings.episodeSync);
  console.log(`Checking ${app.settings.library}`);
  const seriesList = await app.Library.listAsync(app.settings.library);
  for (const series of seriesList) await app.seriesAsync(series.seriesPath, series.seriesUrl);
}
