import * as app from '..';

export async function serverAsync(this: app.ICliOptions) {
  console.log(`Starting ${app.settings.serverUrl}`);
  await app.Server.createAsync();
}
