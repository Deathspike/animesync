import * as ace from '../..';
import * as acm from '..';

export async function downloadAsync(this: acm.IOptions, seriesList: Array<string>) {
  console.log(`Starting ${ace.settings.serverUrl}`);
  await ace.Server.usingAsync(async (api) => {
    await acm.migrateAsync();
    if (seriesList.length) {
      console.log(`Sourcing ${ace.settings.library}`);
      for (const series of seriesList) await acm.seriesAsync(api, ace.settings.library, series, this);
    } else {
      console.log(`Fetching ${ace.settings.library}`);
      const seriesList = await acm.Library.listAsync(ace.settings.library);
      for (const series of seriesList) await acm.seriesAsync(api, series.rootPath ?? ace.settings.library, series.seriesUrl, this);
    }
  });
}
