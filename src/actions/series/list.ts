import * as app from '../..';

export async function seriesListAsync() {
  console.log(`Fetching ${app.settings.library}`);
  const seriesList = await app.Library.listAsync(app.settings.library);
  seriesList.forEach(series => console.log(`* ${series.seriesUrl} -> ${series.seriesPath}`));
}
