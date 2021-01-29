import * as app from '../../..';
import * as cli from '../..';

export async function seriesListAsync() {
  console.info(`Fetching ${app.settings.library}`);
  const seriesList = await cli.Library.listAsync(app.settings.library);
  seriesList.forEach((series) => console.info(`* ${series.seriesUrl} -> ${series.rootPath ?? app.settings.library}`));
}
