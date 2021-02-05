import * as app from '../..';
import * as cli from '..';

export async function downloadAsync(this: cli.IOptions, seriesList: Array<string>) {
  console.info(`Starting ${app.settings.server.url}`);
  await app.Server.usingAsync(async (api) => {
    await cli.migrateAsync();
    if (seriesList.length) {
      console.info(`Sourcing ${app.settings.path.library}`);
      for (const series of seriesList) await cli.seriesAsync(api, app.settings.path.library, series, this);
    } else {
      console.info(`Fetching ${app.settings.path.library}`);
      const seriesList = await cli.Library.listAsync(app.settings.path.library);
      for (const series of seriesList) await cli.seriesAsync(api, series.rootPath ?? app.settings.path.library, series.seriesUrl, this);
    }
  });
}
