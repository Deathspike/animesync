import * as ace from '../../..';
import * as acm from '../..';

export async function seriesListAsync() {
  console.info(`Fetching ${ace.settings.library}`);
  const seriesList = await acm.Library.listAsync(ace.settings.library);
  seriesList.forEach((series) => console.info(`* ${series.seriesUrl} -> ${series.rootPath ?? ace.settings.library}`));
}
