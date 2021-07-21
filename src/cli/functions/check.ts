import * as app from '../..';
import * as cli from '..';
import fs from 'fs-extra';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';
type IWorker = (seriesPath: string, series: app.api.RemoteSeries) => Promise<any>;

export async function checkAsync(api: app.Server, urls: Array<string>, workAsync: IWorker, options?: cli.IOptions, ) {
  await cli.CoreInfo.loadAsync()
    .then(coreInfo => urls && urls.length ? urlAsync(api, coreInfo, urls, workAsync, options) : directoryAsync(api, coreInfo, workAsync))
    .catch((error) => api.logger.error(error));
}

async function directoryAsync(api: app.Server, coreInfo: cli.CoreInfo, workAsync: IWorker) {
  for (const rootPath of coreInfo.rootPaths) {
    if (!await fs.pathExists(rootPath)) continue;
    for (const seriesName of await fs.readdir(rootPath)) {
      const seriesPath = path.join(rootPath, seriesName);
      const seriesInfoPath = path.join(seriesPath, 'tvshow.nfo');
      const seriesInfoXml = await fs.readFile(seriesInfoPath, 'utf8').catch(() => '');
      const seriesInfo = await cli.SeriesInfo.parseAsync(seriesInfoXml).catch(() => {});
      if (seriesInfo && seriesInfo.animesync) {
        api.logger.info(`Checking ${seriesName} (${seriesInfo.animesync})`);
        const series = await api.remote.seriesAsync({url: seriesInfo.animesync});
        if (series.value) {
          await workAsync(seriesPath, series.value);
        } else {
          api.logger.info(`Rejected ${seriesName}`);
        }
      }
    }
  }
}

async function urlAsync(api: app.Server, coreInfo: cli.CoreInfo, urls: Array<string>, workAsync: IWorker, options?: cli.IOptions) {
  for (const url of urls) {
    api.logger.info(`Checking ${url}`);
    const series = await api.remote.seriesAsync({url});
    if (series.value) {
      const rootPath = (options && options.rootPath) ?? app.settings.path.library;
      const seriesName = sanitizeFilename(series.value.title);
      const seriesPath = path.join(rootPath, seriesName);
      await cli.CoreInfo.registerRootPathAsync(coreInfo, rootPath);
      await workAsync(seriesPath, series.value);
    } else {
      api.logger.info(`Rejected ${url}`);
    }
  }
}
