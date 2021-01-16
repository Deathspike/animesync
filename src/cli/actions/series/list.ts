import * as ace from '../../..';
import * as acm from '../..';

export async function seriesListAsync() {
  console.log(`Fetching ${ace.settings.library}`);
  const seriesList = await acm.Library.listAsync(ace.settings.library);
  seriesList.forEach((series) => console.log(`* ${series.seriesUrl} -> ${series.rootPath ?? ace.settings.library}`));
}
