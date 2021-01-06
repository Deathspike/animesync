import * as app from '../..';
import {funimationProvider} from './provider';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function funimationAsync(context: app.Context, rootPath: string, seriesUrl: string, options?: app.ICliOptions) {
  const series = await funimationProvider.seriesAsync(context, seriesUrl);
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new app.Series(app.settings.library);
  for (const season of series.seasons) {
    const seasonMatch = season.title.match(/([0-9\.]+)/);
    const seasonNumber = seasonMatch ? parseFloat(seasonMatch[1]) : NaN;
    for (const episode of season.episodes) {
      const elapsedTime = new app.Timer();
      const episodeNumber = parseFloat(episode.number);
      const episodeName = `${seriesName} ${String(seasonNumber).padStart(2, '0')}x${String(episodeNumber).padStart(2, '0')} [Funimation]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      if (!isFinite(seasonNumber) || !isFinite(episodeNumber)) {
        app.logger.info(`Ignoring ${episodeName}`);
      } else if (await tracker.existsAsync(seriesName, episodeName)) {
        app.logger.info(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        app.logger.info(`Tracking ${episodeName}`);
        await tracker.trackAsync(seriesName, episodeName);
      } else try {
        app.logger.info(`Fetching ${episodeName}`);
        await saveAsync(context, episodePath, episode.url);
        await tracker.trackAsync(seriesName, episodeName);
        app.logger.info(`Finished ${episodeName} (${elapsedTime})`);
      } catch (error) {
        app.logger.info(`Rejected ${episodeName} (${elapsedTime})`);
        app.logger.error(error);
      }
    }
  }
}

async function saveAsync(context: app.Context, episodePath: string, episodeUrl: string) {
  const stream = await funimationProvider.streamAsync(context, episodeUrl);
  const sync = new app.Sync(episodePath);
  await sync.saveAsync(stream);
}
