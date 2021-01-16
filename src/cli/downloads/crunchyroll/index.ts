import * as ace from '../../..';
import * as acm from '../..';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function crunchyrollAsync(api: ace.Server, rootPath: string, url: string, options?: acm.IOptions) {
  const series = await api.remote.seriesAsync({url});
  if (!series.value) throw new Error(`Invalid series: ${url}`);
  await seriesAsync(api, rootPath, series.value, options);
}

async function seriesAsync(api: ace.Server, rootPath: string, series: ace.api.RemoteSeries, options?: acm.IOptions) {
  const seriesName = sanitizeFilename(series.title);
  const seriesPath = path.join(rootPath, seriesName);
  const tracker = new acm.Tracker(ace.settings.library);
  for (const season of series.seasons) {
    const seasonName = sanitizeFilename(season.title);
    for (const episode of season.episodes) {
      const episodeNumber = parseFloat(episode.number);
      const elapsedTime = new acm.Timer();
      const episodeName = `${seasonName} ${String(episodeNumber).padStart(2, '0')} [CrunchyRoll]`;
      const episodePath = `${path.join(seriesPath, episodeName)}.mkv`;
      if (!isFinite(episodeNumber)) {
        api.logger.log(`Ignoring ${episodeName}`);
      } else if (await tracker.existsAsync(seasonName, episodeName) || await tracker.existsAsync(seriesName, episodeName)) {
        api.logger.log(`Skipping ${episodeName}`);
      } else if (options && options.skipDownload) {
        api.logger.log(`Tracking ${episodeName}`);
        await tracker.trackAsync(seriesName, episodeName);
      } else try {
        api.logger.log(`Fetching ${episodeName}`);
        await saveAsync(api, episodePath, episode.url);
        await tracker.trackAsync(seriesName, episodeName);
        api.logger.log(`Finished ${episodeName} (${elapsedTime})`);
      } catch (error) {
        api.logger.log(`Rejected ${episodeName} (${elapsedTime})`);
        api.logger.error(error);
      }
    }
  }
}

async function saveAsync(api: ace.Server, episodePath: string, url: string) {
  const stream = await api.remote.streamAsync({url});
  if (!stream.value) throw new Error(`Invalid stream: ${url}`);
  const sync = new acm.Sync(api, episodePath);
  await sync.saveAsync(stream.value);
}
