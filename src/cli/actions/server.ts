import * as app from '..';

export async function serverAsync(this: app.ICliOptions) {
  app.logger.info(`Starting ${app.settings.serverUrl}`);
  await app.Server.createAsync();
}
