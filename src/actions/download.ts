import * as app from '..';

export async function downloadAsync(seriesList: Array<string>) {
  await app.migrateAsync();
  if (seriesList.length) {
    console.log(`Sourcing ${app.settings.library}`);
    for (const series of seriesList) await app.seriesAsync(app.settings.library, series);
  } else {
    console.log(`Fetching ${app.settings.library}`);
    const seriesList = await app.Library.listAsync(app.settings.library);
    for (const series of seriesList) await app.seriesAsync(series.rootPath || app.settings.library, series.seriesUrl);
  }
}
