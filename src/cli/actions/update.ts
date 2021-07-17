import * as app from '../..';
import * as cli from '..';

export async function updateAsync(this: cli.IOptions, urls: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${api.context.serverUrl}`);
    await app.cli.checkAsync(api, urls, cli.updateAsync.bind(cli, api), this);
  });
}
