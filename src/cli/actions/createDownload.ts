import * as app from '../..';
import * as cli from '..';
import commander from 'commander';

export function createDownload() {
  return commander.createCommand('download')
    .arguments('[seriesUrl...]')
    .description('Downloads series.')
    .option('--rootPath [string]', 'Specifies the root directory for the series.')
    .option('--skipDownload', 'Generate tracking files but skip downloads.')
    .action(downloadAsync);
}

async function downloadAsync(this: cli.IOptions, urls: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${api.context.serverUrl}`);
    await app.cli.checkAsync(api, urls, cli.downloadAsync.bind(cli, api), this);
  });
}
