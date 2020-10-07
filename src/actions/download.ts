import * as app from '..';

export async function downloadAsync() {
  console.log(`Checking ${app.settings.library}`);
  const seriesList = await app.Library.listAsync(app.settings.library);
  for (const series of seriesList) await app.seriesAsync(series.seriesPath, series.seriesUrl);
}
