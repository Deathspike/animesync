import * as app from '../..';
import * as cli from '..';

export async function downloadAsync(this: cli.IOptions, seriesList: Array<string>) {
  console.info(`Starting ${app.settings.serverUrl}`);
  await app.Server.usingAsync(async (api) => {
    await cli.migrateAsync();
    if (seriesList.length) {
      console.info(`Sourcing ${app.settings.library}`);
      for (const series of seriesList) await cli.seriesAsync(api, app.settings.library, series, this);
    } else {
      console.info(`Fetching ${app.settings.library}`);
      const seriesList = await cli.Library.listAsync(app.settings.library);
      for (const series of seriesList) await cli.seriesAsync(api, series.rootPath ?? app.settings.library, series.seriesUrl, this);
    }
  });
}
