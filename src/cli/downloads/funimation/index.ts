import * as app from '../../..';
import * as cli from '../..';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function funimationAsync(api: app.Server, rootPath: string, url: string, options?: cli.IOptions) {
  const series = await api.remote.seriesAsync({url});
  if (!series.value) throw new Error(`Invalid series: ${url}`);
  await seriesAsync(api, rootPath, series.value, options);
}

async function seriesAsync(api: app.Server, rootPath: string, series: app.api.RemoteSeries, options?: cli.IOptions) {
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new cli.Tracker(app.settings.library);
  for (const season of series.seasons) {
    const seasonMatch = season.title.match(/([0-9\.]+)/);
    const seasonNumber = seasonMatch ? parseFloat(seasonMatch[1]) : NaN;
    for (const episode of season.episodes) {
      const elapsedTime = new cli.Timer();
      const episodeData = parseFloat(episode.name);
      const episodeName = `${seriesName} ${String(seasonNumber).padStart(2, '0')}x${String(episodeData).padStart(2, '0')} [Funimation]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      if (!isFinite(seasonNumber) || !isFinite(episodeData)) {
        api.logger.info(`Ignoring ${episodeName}`);
      } else if (await tracker.existsAsync(seriesName, episodeName)) {
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
