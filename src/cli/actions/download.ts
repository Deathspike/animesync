import * as app from '..';

export async function downloadAsync(this: app.ICliOptions, seriesList: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    await app.migrateAsync();
    if (seriesList.length) {
      app.logger.info(`Sourcing ${app.settings.library}`);
      for (const series of seriesList) await app.seriesAsync(api, app.settings.library, series, this);
    } else {
      app.logger.info(`Fetching ${app.settings.library}`);
      const seriesList = await app.Library.listAsync(app.settings.library);
      for (const series of seriesList) await app.seriesAsync(api, series.rootPath ?? app.settings.library, series.seriesUrl, this);
    }
  });
}
