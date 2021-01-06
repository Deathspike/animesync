import * as app from '../..';
import {crunchyrollProvider} from './provider';
import fetch from 'node-fetch';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function crunchyrollAsync(context: app.Context, rootPath: string, seriesUrl: string, options?: app.ICliOptions) {
  const series = await crunchyrollProvider.seriesAsync(context, seriesUrl);
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new app.Series(app.settings.library);
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
  const stream = await crunchyrollProvider.streamAsync(context, episodeUrl);
  const sync = new app.Sync(episodePath, 'ass', app.settings.sync);
  try {
    const assSubtitle = await fetch(stream.subtitleUrl).then(x => x.text());
    await sync.saveAsync(stream.manifestUrl, assSubtitle);
  } finally {
    await sync.disposeAsync();
  }
}
