import * as app from '../../..';
import * as cli from '../..';

export async function seriesAddAsync(seriesUrl: string, rootPath?: string) {
  const library = await cli.Library.loadAsync(app.settings.library);
  const success = await library.addAsync(seriesUrl, rootPath);
  console.info(`Series '${seriesUrl}' ${success ? 'has been added' : 'exists'}.`)
}
