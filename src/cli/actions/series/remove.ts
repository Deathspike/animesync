import * as app from '../../..';
import * as cli from '../..';

export async function seriesRemoveAsync(seriesUrl: string) {
  const library = await cli.Library.loadAsync(app.settings.path.library);
  const success = await library.removeAsync(seriesUrl);
  console.info(`Series '${seriesUrl}' ${success ? 'has been removed' : 'does not exist'}.`)
}
