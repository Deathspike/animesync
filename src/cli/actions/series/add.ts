import * as app from '../../..';
import * as apx from '../..';

export async function seriesAddAsync(seriesUrl: string, rootPath?: string) {
  const library = await apx.Library.loadAsync(app.settings.library);
  const success = await library.addAsync(seriesUrl, rootPath);
  console.log(`Series '${seriesUrl}' ${success ? 'has been added' : 'exists'}.`)
}
