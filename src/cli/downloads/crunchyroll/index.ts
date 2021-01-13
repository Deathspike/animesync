import * as app from '../..';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function crunchyrollAsync(api: app.api.ServerApi, rootPath: string, url: string, options?: app.ICliOptions) {
  const series = await api.remote.seriesAsync({url});
  if (!series.value) throw new Error(`Invalid series: ${url}`);
  await seriesAsync(api, rootPath, series.value, options);
}

async function seriesAsync(api: app.api.ServerApi, rootPath: string, series: app.api.RemoteSeries, options?: app.ICliOptions) {
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new app.Tracker(app.settings.library);
  for (const season of series.seasons) {
    const seasonName = sanitizeFilename(season.title);
    for (const episode of season.episodes) {
      const episodeNumber = parseFloat(episode.number);
      const elapsedTime = new app.Timer();
      const episodeName = `${seasonName} ${String(episodeNumber).padStart(2, '0')} [CrunchyRoll]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      if (!isFinite(episodeNumber)) {
        app.logger.info(`Ignoring ${episodeName}`);
      } else if (await tracker.existsAsync(seasonName, episodeName) || await tracker.existsAsync(seriesName, episodeName)) {
        app.logger.info(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        app.logger.info(`Tracking ${episodeName}`);
        await tracker.trackAsync(seriesName, episodeName);
      } else try {
        app.logger.info(`Fetching ${episodeName}`);
        await saveAsync(api, episodePath, episode.url);
        await tracker.trackAsync(seriesName, episodeName);
        app.logger.info(`Finished ${episodeName} (${elapsedTime})`);
      } catch (error) {
        app.logger.info(`Rejected ${episodeName} (${elapsedTime})`);
        app.logger.error(error);
      }
    }
  }
}

async function saveAsync(api: app.api.ServerApi, episodePath: string, url: string) {
  const stream = await api.remote.streamAsync({url});
  if (!stream.value) throw new Error(`Invalid stream: ${url}`);
  const sync = new app.Sync(episodePath);
  await sync.saveAsync(stream.value);
}
