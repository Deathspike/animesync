import * as app from '..';
import commander from 'commander';

export function createUpdate() {
  return commander.createCommand('update').alias('add')
    .arguments('[seriesUrl...]')
    .description('Updates or adds series.')
    .option('--rootPath [string]', 'Specifies the root directory for the series.')
    .action(checkAsync);
}

async function checkAsync(this: app.Options, urls: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${app.settings.server.url}`);
    await app.checkAsync(api, urls, updateAsync.bind(app, api), this);
  });
}

async function updateAsync(api: app.Server, series: app.api.LibraryContextSeries, sourceUrl?: string) {
  if (sourceUrl) return;
  api.logger.info(`Updating ${series.title}`);
  if (await api.library.seriesPutAsync({seriesId: series.id}).then(x => x.success)) return;
  api.logger.info(`Rejected ${series.title}`);
}
