import * as app from '../..';

export async function seriesListAsync() {
  app.logger.info(`Fetching ${app.settings.library}`);
  const seriesList = await app.Library.listAsync(app.settings.library);
  seriesList.forEach((series) => app.logger.info(`* ${series.seriesUrl} -> ${series.rootPath || app.settings.library}`));
}
