import * as app from '../../..';
import * as cli from '../..';
import * as clv from 'class-validator';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function crunchyrollAsync(api: app.Server, rootPath: string, url: string, options?: cli.IOptions) {
  const series = await api.remote.seriesAsync({url});
  if (!series.value) throw new Error(`Invalid series: ${url}`);
  await seriesAsync(api, rootPath, series.value, options);
}

async function seriesAsync(api: app.Server, rootPath: string, series: app.api.RemoteSeries, options?: cli.IOptions) {
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new cli.Tracker(app.settings.path.library);
  for (const season of series.seasons) {
    const seasonName = sanitizeFilename(season.title);
    for (const episode of season.episodes) {
      const elapsedTime = new cli.Timer();
      const episodeData = clv.isNumberString(episode.name) ? episode.name.padStart(2, '0') : episode.name;
      const episodeName = `${seasonName} ${episodeData} [Crunchyroll]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      if (await tracker.existsAsync(seasonName, episodeName) || await tracker.existsAsync(seriesName, episodeName)) {
        api.logger.info(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        api.logger.info(`Tracking ${episodeName}`);
        await tracker.trackAsync(seriesName, episodeName);
      } else try {
        api.logger.info(`Fetching ${episodeName}`);
        await saveAsync(api, episodePath, episode.url);
        await tracker.trackAsync(seriesName, episodeName);
        api.logger.info(`Finished ${episodeName} (${elapsedTime})`);
      } catch (error) {
        api.logger.error(error);
        api.logger.info(`Rejected ${episodeName} (${elapsedTime})`);
      }
    }
  }
}

async function saveAsync(api: app.Server, episodePath: string, url: string) {
  const stream = await api.remote.streamAsync({url});
  if (!stream.value) throw new Error(`Invalid stream: ${url}`);
  const sync = new cli.Sync(api, episodePath);
  await sync.saveAsync(stream.value);
}
