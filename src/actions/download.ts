import * as app from '..';

export async function downloadAsync(this: app.ISeriesOptions, seriesList: Array<string>) {
  await app.migrateAsync();
  if (seriesList.length) {
    app.logger.info(`Sourcing ${app.settings.library}`);
    for (const series of seriesList) await app.seriesAsync(app.settings.library, series, this);
  } else {
    app.logger.info(`Fetching ${app.settings.library}`);
    const seriesList = await app.Library.listAsync(app.settings.library);
    for (const series of seriesList) await app.seriesAsync(series.rootPath || app.settings.library, series.seriesUrl, this);
  }
}
