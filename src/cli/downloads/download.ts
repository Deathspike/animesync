import * as app from '../..';
import * as cli from '..';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

export async function downloadAsync(api: app.Server, rootPath: string, provider: app.api.RemoteProvider, series: app.api.RemoteSeries, options?: cli.IOptions) {
  const seriesName = sanitizeFilename(series.title);
  const tracker = new cli.Tracker(app.settings.path.library);
  for (const season of series.seasons) {
    const seasonName = sanitizeFilename(season.title);
    for (const episode of season.episodes) {
      const elapsedTime = new cli.Timer();
      const episodeName = sanitizeFilename(episode.name);
      const episodeFile = getEpisodeFile(provider, series, seasonName, episodeName);
      if (await tracker.existsAsync(seasonName, episodeFile) || await tracker.existsAsync(seriesName, episodeFile)) {
        api.logger.info(`Skipping ${episodeFile}`);
      } else if (options && options.skipDownload) {
        api.logger.info(`Tracking ${episodeFile}`);
        await tracker.trackAsync(seriesName, episodeFile);
      } else {
        api.logger.info(`Fetching ${episodeFile}`);
        const stream = await api.remote.streamAsync({url: episode.url});
        if (stream.value) {
          const sync = new cli.Sync(api, `${path.join(rootPath, seriesName, episodeFile)}.mkv`);
          await sync.saveAsync(stream.value);
          await tracker.trackAsync(seriesName, episodeFile);
          api.logger.info(`Finished ${episodeFile} (${elapsedTime})`);
        } else {
          api.logger.info(`Rejected ${episodeFile}`);
        }
      }
    }
  }
}

function getEpisodeFile(provider: app.api.RemoteProvider, series: app.api.RemoteSeries, seasonName: string, episodeName: string) {
  const seasonMatch = seasonName.match(/^Season\s+([0-9\.]+)$/i);
  const seasonNumber = seasonMatch && parseFloat(seasonMatch[1]).toString().padStart(2, '0');
  const episodeNumber = episodeName.padStart(Number(/^[0-9\.]+$/.test(episodeName)) + 1, '0');
  if (seasonNumber) {
    const seriesName = sanitizeFilename(series.title);
    return `${seriesName} ${seasonNumber}x${episodeNumber} [${provider.label}]`;
  } else {
    return `${seasonName} ${episodeNumber} [${provider.label}]`;
  }
}
