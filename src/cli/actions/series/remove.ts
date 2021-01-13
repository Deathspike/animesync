import * as app from '../..';

export async function seriesRemoveAsync(seriesUrl: string) {
  const library = await app.Library.loadAsync(app.settings.library);
  const success = await library.removeAsync(seriesUrl);
  app.logger.info(`Series '${seriesUrl}' ${success ? 'has been removed' : 'does not exist'}.`)
}
