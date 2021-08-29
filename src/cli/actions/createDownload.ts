import * as app from '../..';
import * as cli from '..';
import commander from 'commander';
import fs from 'fs';
import path from 'path';

export function createDownload() {
  return commander.createCommand('download')
    .arguments('[seriesUrl...]')
    .description('Downloads series.')
    .option('--rootPath [string]', 'Specifies the root directory for the series.')
    .option('--skipDownload', 'Generate trackers instead of episodes.')
    .option('--skipUpdate', 'Download episodes for existing metadata.')
    .action(checkAsync);
}

async function checkAsync(this: cli.Options, urls: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    api.logger.info(`Listening at ${app.settings.server.url}`);
    await cli.checkAsync(api, urls, downloadAsync.bind(this, api), this);
  });
}

async function downloadAsync(this: cli.Options, api: app.Server, series: app.api.LibraryContextSeries, sourceUrl?: string) {
  await tryUpdateAsync(api, series, sourceUrl, this);
  const context = await api.library.seriesAsync({seriesId: series.id});
  const seasons = context.value?.seasons ?? [];
  for (const season of seasons) {
    const seasonName = path.basename(season.path);
    for (const episode of season.episodes) {
      const episodeName = path.basename(episode.path);
      const trackerPath = path.join(series.path, '.animesync', seasonName, episodeName);
      const tracked = await fs.promises.access(trackerPath).then(() => true, () => false);
      if (episode.active || episode.available || tracked) {
        api.logger.info(`Skipping ${episodeName}`);
      } else if (this.skipDownload) {
        api.logger.info(`Tracking ${episodeName}`);
        await trackAsync(trackerPath);
      } else {
        api.logger.info(`Fetching ${episodeName}`);
        if (await api.library.episodePutAsync({seriesId: series.id, episodeId: episode.id}).then(x => x.success)) {
          await trackAsync(trackerPath);
        } else {
          api.logger.info(`Rejected ${path.basename(episode.path)}`);
        }
      }
    }
  }
}

async function trackAsync(trackerPath: string) {
  const dirPath = path.dirname(trackerPath);
  await fs.promises.mkdir(dirPath, {recursive: true});
  await fs.promises.writeFile(trackerPath, Buffer.alloc(0));
}

async function tryUpdateAsync(api: app.Server, series: app.api.LibraryContextSeries, sourceUrl?: string, options?: cli.Options) {
  if (sourceUrl || options?.skipUpdate) return;
  api.logger.info(`Updating ${series.title}`);
  await api.library.seriesPutAsync({seriesId: series.id});
}
