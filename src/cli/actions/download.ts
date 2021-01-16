import * as app from '../..';
import * as apx from '..';

export async function downloadAsync(this: apx.IOptions, seriesList: Array<string>) {
  console.log(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async (api) => {
    await apx.migrateAsync();
    if (seriesList.length) {
      console.log(`Sourcing ${app.settings.library}`);
      for (const series of seriesList) await apx.seriesAsync(api, app.settings.library, series, this);
    } else {
      console.log(`Fetching ${app.settings.library}`);
      const seriesList = await apx.Library.listAsync(app.settings.library);
      for (const series of seriesList) await apx.seriesAsync(api, series.rootPath ?? app.settings.library, series.seriesUrl, this);
    }
  });
}
