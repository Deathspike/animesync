import * as ace from '../../..';
import * as acm from '../..';

export async function seriesAddAsync(seriesUrl: string, rootPath?: string) {
  const library = await acm.Library.loadAsync(ace.settings.library);
  const success = await library.addAsync(seriesUrl, rootPath);
  console.log(`Series '${seriesUrl}' ${success ? 'has been added' : 'exists'}.`)
}
