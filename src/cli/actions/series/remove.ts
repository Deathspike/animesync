import * as ace from '../../..';
import * as acm from '../..';

export async function seriesRemoveAsync(seriesUrl: string) {
  const library = await acm.Library.loadAsync(ace.settings.library);
  const success = await library.removeAsync(seriesUrl);
  console.info(`Series '${seriesUrl}' ${success ? 'has been removed' : 'does not exist'}.`)
}
