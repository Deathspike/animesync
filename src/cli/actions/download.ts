import * as app from '../..';
import * as cli from '..';
import fs from 'fs-extra';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function downloadAsync(this: cli.IOptions, urls?: Array<string>) {
  await app.Server.usingAsync(async (api) => {
    console.info(`Listening at ${api.context.serverUrl}`);
    await cli.CoreInfo.loadAsync()
      .then(x => urls && urls.length ? urlAsync(api, x, urls, this) : directoryAsync(api, x))
      .catch((error) => api.logger.error(error));
  });
}

async function directoryAsync(api: app.Server, coreInfo: cli.CoreInfo) {
  for (const rootPath of coreInfo.rootPaths) {
    if (!await fs.pathExists(rootPath)) continue;
    for (const seriesName of await fs.readdir(rootPath)) {
      const seriesPath = path.join(rootPath, seriesName);
      const seriesInfoPath = path.join(seriesPath, 'tvshow.nfo');
      const seriesInfoXml = await fs.readFile(seriesInfoPath, 'utf8').catch(() => '');
      const seriesInfo = await cli.SeriesInfo.parseAsync(seriesInfoXml).catch(() => undefined);
      if (seriesInfo && seriesInfo.animesync) {
        api.logger.info(`Fetching ${seriesName} (${seriesInfo.animesync})`);
        const series = await api.remote.seriesAsync({url: seriesInfo.animesync});
        if (series.value) {
          await cli.downloadAsync(api, seriesPath, series.value);
          api.logger.info(`Finished ${seriesInfo.animesync}`);
        } else {
          api.logger.info(`Skipping ${seriesInfo.animesync}`);
        }
      }
    }
  }
}

async function urlAsync(api: app.Server, coreInfo: cli.CoreInfo, urls: Array<string>, options?: cli.IOptions) {
  for (const url of urls) {
    api.logger.info(`Fetching ${url}`);
    const series = await api.remote.seriesAsync({url});
    if (series.value) {
      const rootPath = (options && options.rootPath) ?? app.settings.path.library;
      const seriesName = sanitizeFilename(series.value.title);
      const seriesPath = path.join(rootPath, seriesName);
      await cli.CoreInfo.registerRootPathAsync(coreInfo, rootPath);
      await cli.downloadAsync(api, seriesPath, series.value, options);
      api.logger.info(`Finished ${url}`);
    } else {
      api.logger.info(`Rejected ${url}`);
    }
  }
}
