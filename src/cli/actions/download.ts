import * as app from '..';

export async function downloadAsync(this: app.ICliOptions, seriesList: Array<string>) {
  console.log(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async (api) => {
    await app.migrateAsync();
    if (seriesList.length) {
      console.log(`Sourcing ${app.settings.library}`);
      for (const series of seriesList) await app.seriesAsync(api, app.settings.library, series, this);
    } else {
      console.log(`Fetching ${app.settings.library}`);
      const seriesList = await app.Library.listAsync(app.settings.library);
      for (const series of seriesList) await app.seriesAsync(api, series.rootPath ?? app.settings.library, series.seriesUrl, this);
    }
  });
}
