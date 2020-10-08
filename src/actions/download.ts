import * as app from '..';

export async function downloadAsync(seriesList: string[]) {
  if (seriesList.length) {
    console.log(`Sourcing ${app.settings.library}`);
    for (const series of seriesList) await app.seriesAsync(app.settings.library, series);
  } else {
    console.log(`Fetching ${app.settings.library}`);
    const seriesList = await app.Library.listAsync(app.settings.library);
    for (const series of seriesList) await app.seriesAsync(series.rootPath, series.seriesUrl);
  }
}
