import * as app from '../..';
import * as apx from '..';

export async function serverAsync(this: apx.IOptions) {
  console.log(`Starting ${app.settings.serverUrl}`);
  await app.Server.createAsync();
}
