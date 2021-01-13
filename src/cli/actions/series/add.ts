import * as app from '../..';

export async function seriesAddAsync(seriesUrl: string, rootPath?: string) {
  const library = await app.Library.loadAsync(app.settings.library);
  const success = await library.addAsync(seriesUrl, rootPath);
  app.logger.info(`Series '${seriesUrl}' ${success ? 'has been added' : 'exists'}.`)
}
