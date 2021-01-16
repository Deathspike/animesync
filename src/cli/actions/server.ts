import * as ace from '../..';
import * as acm from '..';

export async function serverAsync(this: acm.IOptions) {
  console.log(`Starting ${ace.settings.serverUrl}`);
  await ace.Server.createAsync();
}
