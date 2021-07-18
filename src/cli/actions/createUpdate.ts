import * as app from '../..';
import * as cli from '..';
import commander from 'commander';

export function createUpdate() {
  return commander.createCommand('update').alias('add')
    .arguments('[seriesUrl...]')
    .description('Updates or adds series.')
    .option('--rootPath [string]', 'Specifies the root directory for the series.')
    .action(updateAsync);
}

async function updateAsync(this: cli.IOptions, urls: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${api.context.serverUrl}`);
    await app.cli.checkAsync(api, urls, cli.updateAsync.bind(cli, api), this);
  });
}
