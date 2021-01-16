import * as app from '../../..';
import * as apx from '../..';

export async function seriesRemoveAsync(seriesUrl: string) {
  const library = await apx.Library.loadAsync(app.settings.library);
  const success = await library.removeAsync(seriesUrl);
  console.log(`Series '${seriesUrl}' ${success ? 'has been removed' : 'does not exist'}.`)
}
