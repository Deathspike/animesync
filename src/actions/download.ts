import * as app from '..';

export async function downloadAsync(this: app.ICliOptions, seriesList: Array<string>) {
  await app.Context.usingAsync(async (context) => {
    await app.migrateAsync();
    if (seriesList.length) {
      app.logger.info(`Sourcing ${app.settings.library}`);
      for (const series of seriesList) await app.seriesAsync(context, app.settings.library, series, this);
    } else {
      app.logger.info(`Fetching ${app.settings.library}`);
      const seriesList = await app.Library.listAsync(app.settings.library);
      for (const series of seriesList) await app.seriesAsync(context, series.rootPath ?? app.settings.library, series.seriesUrl, this);
    }
  });
}
